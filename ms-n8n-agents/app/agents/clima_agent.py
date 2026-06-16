from dotenv import load_dotenv
load_dotenv()

import re
import requests
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, ToolMessage

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


@tool
def obtener_pronostico(ciudad: str) -> str:
    """Obtiene pronóstico del clima para la ciudad incluyendo probabilidad de lluvia."""
    geo = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": ciudad, "count": 1, "language": "es"},
        timeout=10,
    ).json()
    resultados = geo.get("results")
    if not resultados:
        return f"No se encontró información para la ciudad: {ciudad}"
    result = resultados[0]
    lat, lon = result["latitude"], result["longitude"]
    clima = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": lat,
            "longitude": lon,
            "current": ["temperature_2m", "precipitation_probability", "weathercode"],
            "daily": ["precipitation_probability_max", "temperature_2m_max", "temperature_2m_min"],
            "timezone": "auto",
            "forecast_days": 1,
        },
        timeout=10,
    ).json()
    prob_lluvia = clima["daily"]["precipitation_probability_max"][0]
    temp = clima["current"]["temperature_2m"]
    return (
        f"Ciudad: {result['name']}. "
        f"Temperatura: {temp}°C. "
        f"Probabilidad lluvia: {prob_lluvia}%."
    )


@tool
def generar_mensaje_clima(pronostico: str, horario_viaje: str) -> str:
    """Genera el mensaje personalizado para el usuario según el pronóstico."""
    pass


tools = [obtener_pronostico, generar_mensaje_clima]
llm_with_tools = llm.bind_tools(tools)
tools_map = {t.name: t for t in tools}


def run_clima_agent(ciudad: str, horario_viaje: str) -> dict:
    """
    Patrón del profesor:
    1ra llamada → LLM decide tools → ejecutar tools → 2da llamada con ToolMessage → mensaje final
    """
    prompt = (
        f"El usuario viaja a las {horario_viaje}. "
        f"Obtén el pronóstico del clima para {ciudad}. "
        "Luego genera un mensaje personalizado:\n"
        "- Si lluvia > 50%: '🌧️ Hoy lloverá (X% probabilidad). Temperatura: Y°C. "
        "Te recomendamos salir 15 minutos antes. ¡No olvides tu paraguas!'\n"
        "- Si no: '☀️ Clima favorable hoy. Temperatura: Y°C. ¡Buen viaje!'"
    )
    messages = [HumanMessage(content=prompt)]

    # Primera llamada: el LLM decide qué tools invocar
    response = llm_with_tools.invoke(messages)
    messages.append(response)

    pronostico_raw = ""

    # Ejecutar cada tool solicitada
    for tc in response.tool_calls:
        tool_fn = tools_map[tc["name"]]
        result = tool_fn.invoke(tc["args"])
        if tc["name"] == "obtener_pronostico":
            pronostico_raw = result or ""
        result_str = str(result) if result is not None else ""
        messages.append(ToolMessage(content=result_str, tool_call_id=tc["id"]))

    # Segunda llamada: el LLM genera el mensaje final con los datos de los tools
    final = llm_with_tools.invoke(messages)
    mensaje = final.content or ""

    # Extraer valores numéricos del pronostico raw para el payload de retorno
    prob_lluvia = 0
    temperatura = 0.0
    try:
        m = re.search(r"Probabilidad lluvia:\s*(\d+)%", pronostico_raw)
        if m:
            prob_lluvia = int(m.group(1))
        m = re.search(r"Temperatura:\s*([\d.]+)°C", pronostico_raw)
        if m:
            temperatura = float(m.group(1))
    except Exception:
        pass

    return {
        "mensaje": mensaje,
        "prob_lluvia": prob_lluvia,
        "temperatura": temperatura,
        "requiere_alerta": prob_lluvia > 50,
    }
