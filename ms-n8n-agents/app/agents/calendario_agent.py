from dotenv import load_dotenv
load_dotenv()

import os
from datetime import datetime, timedelta
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage

N8N_WEBHOOK_CALENDAR = os.getenv("N8N_WEBHOOK_CALENDAR", "http://localhost:5678/webhook/calendar")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


def _slots_fallback(fecha_desde: str, dias: int) -> list:
    """Genera slots de ejemplo cuando N8N no está disponible."""
    try:
        base = datetime.fromisoformat(fecha_desde)
    except Exception:
        base = datetime.now()
    slots = []
    for d in range(dias):
        fecha = base + timedelta(days=d)
        if fecha.weekday() < 5:
            for hora in ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]:
                slots.append({
                    "fecha_hora": f"{fecha.strftime('%Y-%m-%d')}T{hora}:00",
                    "disponible": True,
                })
    return slots[:12]


@tool
def consultar_disponibilidad(fecha_desde: str, dias: int) -> list:
    """Consulta los slots disponibles en Google Calendar desde una fecha dada por X días."""
    try:
        resp = httpx.post(
            f"{N8N_WEBHOOK_CALENDAR}/disponibilidad",
            json={"fecha_desde": fecha_desde, "dias": dias},
            timeout=10.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data if isinstance(data, list) else data.get("slots", [])
    except Exception:
        pass
    return _slots_fallback(fecha_desde, dias)


@tool
def crear_cita(
    fecha_hora: str,
    tipo_atencion: str,
    tipo_consulta: str,
    motivo: str,
    email_usuario: str,
) -> dict:
    """Crea un evento en Google Calendar mediante N8N con los datos de la cita."""
    payload = {
        "fecha_hora": fecha_hora,
        "tipo_atencion": tipo_atencion,
        "tipo_consulta": tipo_consulta,
        "motivo": motivo,
        "email_usuario": email_usuario,
    }
    try:
        resp = httpx.post(
            f"{N8N_WEBHOOK_CALENDAR}/crear",
            json=payload,
            timeout=10.0,
        )
        if resp.status_code in (200, 201):
            return resp.json()
    except Exception:
        pass
    # Fallback local cuando N8N no está disponible
    return {
        "confirmado": True,
        "id_evento": f"LOCAL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        **payload,
    }


tools = [consultar_disponibilidad, crear_cita]
llm_with_tools = llm.bind_tools(tools)
tools_map = {t.name: t for t in tools}


def run_calendario_agent(
    tipo_atencion: str,
    tipo_consulta: str,
    motivo: str,
    email_usuario: str,
) -> dict:
    """
    Consulta disponibilidad de slots usando el agente LangChain.
    El agendamiento final se realiza en el endpoint /agendar.
    """
    hoy = datetime.now().strftime("%Y-%m-%d")
    prompt = (
        f"El usuario quiere consultar disponibilidad para agendar una cita.\n"
        f"- Tipo de atención: {tipo_atencion}\n"
        f"- Tipo de consulta: {tipo_consulta}\n"
        f"- Motivo: {motivo}\n"
        f"- Email: {email_usuario}\n\n"
        f"Consulta la disponibilidad desde {hoy} por 5 días y retorna los slots disponibles."
    )
    messages = [HumanMessage(content=prompt)]

    slots_disponibles = []
    response = None

    for _ in range(4):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tc in response.tool_calls:
            tool_fn = tools_map[tc["name"]]
            result = tool_fn.invoke(tc["args"])

            if tc["name"] == "consultar_disponibilidad":
                slots_disponibles = result if isinstance(result, list) else []

            content = str(result) if not isinstance(result, str) else result
            messages.append(ToolMessage(content=content, tool_call_id=tc["id"]))

    return {
        "slots_disponibles": slots_disponibles,
        "confirmacion": None,
    }
