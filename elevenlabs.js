// elevenlabs.js — voz real de Neko 💖
//const voiceId = "htFfPSZGJwjBv1CL0aMD"; // Antonio- Larino conversacional seguro de si mismo

//async function hablarConVoz(texto) {
  //try {
    //const response = await fetch("https://neko-jgqp.onrender.com/voz", {
      //method: "POST",
     // headers: { "Content-Type": "application/json" },
      //body: JSON.stringify({ texto }),
   // });

//    if (!response.ok) {
//      console.error("Error con el servidor local:", await response.text());
//      return;
//    }

//    const audioBlob = await response.blob();
//    const audioUrl = URL.createObjectURL(audioBlob);
//    const audio = new Audio(audioUrl);
//    audio.play();
//  } catch (err) {
//    console.error("Error al reproducir voz:", err);
//  }
//}

// elevenlabs.js — Voz Nativa del Navegador (Sin API Key)

async function hablarConVoz(texto) {
  try {
      // 1. Crear el objeto de síntesis de voz
      const utterance = new SpeechSynthesisUtterance(texto);

      // 2. Opcional: Configurar la voz
      // Aquí puedes elegir una voz robótica o neutra que esté disponible en el navegador.
      // Si no se especifica, usa la voz predeterminada del sistema.
      utterance.lang = 'es-ES'; 
      utterance.rate = 1.0; // Velocidad de la voz
      utterance.pitch = 1.0; // Tono de la voz

      // 3. Hablar
      window.speechSynthesis.speak(utterance);

  } catch (err) {
      // Si la síntesis de voz falla (navegador viejo o permisos), mostrar error.
      console.error("Error al usar la voz nativa del navegador:", err);
  }
}

// 💥 ¡IMPORTANTE! Ahora, exporta la función para que script.js la vea
export { hablarConVoz };