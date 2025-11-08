// serper.js — búsqueda precisa en Google 🌐
const serperApiKey = process.env.SERPER_API_KEY;

async function buscarEnGoogle(pregunta) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": serperApiKey
      },
      body: JSON.stringify({ q: pregunta, gl: "es", hl: "es" })
    });

    const data = await response.json();

    if (data.answerBox?.answer) return data.answerBox.answer;
    if (data.answerBox?.snippet) return data.answerBox.snippet;
    if (data.organic && data.organic.length > 0) {
      return data.organic[0].snippet;
    }

    return "No encontré información precisa 😿";
  } catch (error) {
    console.error("Error con Serper:", error);
    return "Hubo un problema buscando en internet 😿";
  }
}

// 💥 La corrección: Exportar la función para que server.js la pueda importar
export { buscarEnGoogle };