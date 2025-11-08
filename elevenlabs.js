// elevenlabs.js — voz real de Neko 💖
const voiceId = "htFfPSZGJwjBv1CL0aMD"; // Antonio- Larino conversacional seguro de si mismo

async function hablarConVoz(texto) {
  try {
    const response = await fetch("https://neko-jgqp.onrender.com/voz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });

    if (!response.ok) {
      console.error("Error con el servidor local:", await response.text());
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("Error al reproducir voz:", err);
  }
}
