from dotenv import load_dotenv
load_dotenv()

import os
import random
import httpx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage

SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK", "")

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

_DEPT_MAP = {
    "Conductor": "operaciones@buses.com",
    "Bus": "mantenimiento@buses.com",
    "Ruta": "planificacion@buses.com",
    "Tarjeta": "pagos@buses.com",
}

_TIEMPO_MAP = {
    "Queja": 5,
    "Reclamo": 7,
    "Sugerencia": 10,
    "Felicitacion": 3,
}


@tool
def generar_radicado() -> str:
    """Genera un número de radicado único para el PQRS en formato PQRS-2026-XXXXXX."""
    numero = random.randint(100000, 999999)
    return f"PQRS-2026-{numero}"


@tool
def clasificar_departamento(categoria: str) -> str:
    """Retorna el email del departamento responsable según la categoría del PQRS."""
    return _DEPT_MAP.get(categoria, "soporte@buses.com")


@tool
def enviar_notificacion_slack(mensaje: str, canal: str) -> str:
    """Envía una notificación al canal de Slack especificado vía webhook."""
    if not SLACK_WEBHOOK:
        return "Slack webhook no configurado — notificación omitida"
    try:
        resp = httpx.post(
            SLACK_WEBHOOK,
            json={"text": mensaje, "channel": canal},
            timeout=5.0,
        )
        if resp.status_code == 200:
            return "Notificación enviada a Slack correctamente"
        return f"Error Slack HTTP {resp.status_code}"
    except Exception as exc:
        return f"Error al contactar Slack: {exc}"


tools = [generar_radicado, clasificar_departamento, enviar_notificacion_slack]
llm_with_tools = llm.bind_tools(tools)
tools_map = {t.name: t for t in tools}


def run_pqrs_agent(tipo: str, categoria: str, descripcion: str, email_usuario: str) -> dict:
    """
    Ejecuta el agente PQRS con el patrón multi-tool del profesor:
    El LLM llama tools en múltiples rondas hasta generar la respuesta final.
    """
    prompt = (
        f"Procesa este PQRS y sigue estos pasos en orden:\n"
        f"1. Genera el número de radicado\n"
        f"2. Clasifica el departamento responsable para categoría: {categoria}\n"
        f"3. Envía notificación a Slack canal #pqrs con un resumen del caso\n"
        f"4. Genera un mensaje de confirmación amigable para el usuario\n\n"
        f"Datos del PQRS:\n"
        f"- Tipo: {tipo}\n"
        f"- Categoría: {categoria}\n"
        f"- Descripción: {descripcion}\n"
        f"- Email usuario: {email_usuario}"
    )
    messages = [HumanMessage(content=prompt)]

    radicado = ""
    departamento_email = ""
    response = None

    # Ciclo de ejecución: el LLM puede llamar tools en múltiples rondas
    for _ in range(6):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tc in response.tool_calls:
            tool_fn = tools_map[tc["name"]]
            result = tool_fn.invoke(tc["args"])

            if tc["name"] == "generar_radicado":
                radicado = str(result)
            elif tc["name"] == "clasificar_departamento":
                departamento_email = str(result)

            messages.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))

    mensaje_confirmacion = (
        response.content
        if (response and response.content)
        else (
            f"Tu PQRS ha sido registrado con radicado {radicado}. "
            f"Será atendido en {_TIEMPO_MAP.get(tipo, 7)} días hábiles."
        )
    )

    return {
        "radicado": radicado,
        "departamento_email": departamento_email,
        "mensaje_confirmacion": mensaje_confirmacion,
        "tiempo_estimado_dias": _TIEMPO_MAP.get(tipo, 7),
    }
