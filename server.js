// server.js (CÓDIGO FINAL CON GEMINI + Serper + ElevenLabs)

import express from "express"; 
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Importar la lógica de búsqueda desde serper.js
import { buscarEnGoogle } from './serper.js'; 

// --- INICIALIZACIÓN CLAVE ---
const app = express();
const PORT = process.env.PORT || 3000;
// -----------------------------


// server.js (Sección de CLAVES)

// Render inyectará las claves secretas usando process.env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; 
const SERPER_API_KEY = process.env.SERPER_API_KEY; 
const VOICE_ID = "htFfPSZGJwjBv1CL0aMD"; // Este ID no es secreto y se puede dejar
// -------------------------------------------------------------------------


app.use(cors());
app.use(express.json());

// Para resolver rutas en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. SERVIR ARCHIVOS ESTÁTICOS
app.use(express.static(__dirname));

// ----------------------------------------------------
// 2. RUTA CENTRAL DE CHAT: /chat-completo (GEMINI - CORREGIDA)
// ----------------------------------------------------
app.post("/chat-completo", async (req, res) => {
  const { prompt } = req.body;

  try {
    // A. OBTENER INFORMACIÓN DE INTERNET (Usando serper.js)
    const searchResult = await buscarEnGoogle(prompt);

// server.js (dentro de app.post("/chat-completo", ...) )

// server.js (B. CONSTRUIR LAS INSTRUCCIONES PARA GEMINI)

const systemInstruction = `
    Eres Neko, un útil asistente de chat.
    Tu rol es responder a la pregunta del usuario.
    
    // ✅ CLAVE CORREGIDA: Usar UTILLIZA en lugar de OBLIGATORIO/SOLO DEBES.
    UTILIZA la información proporcionada en el bloque [INFORMACIÓN DE BÚSQUEDA] para dar una respuesta precisa. 
    Si la información de búsqueda es inútil o no es relevante, puedes usar tu conocimiento general.
    
    Tu respuesta debe ser muy concisa, no debe superar los 100 palabras.
    **NO DEBES** citar textualmente la fuente. Usa tus propias palabras.
    Si la pregunta es un saludo básico, ignora la búsqueda y responde amigablemente.
`; // ❌ ¡Quitamos la línea "Información de Búsqueda: ${searchResult}" de aquí!
    
    // C. LLAMAR A LA API DE GEMINI (FORMATO CORREGIDO CON generationConfig)
    // server.js (dentro de app.post("/chat-completo", ...))

// ... código de Serper, systemInstruction (B. CONSTRUIR LAS INSTRUCCIONES), etc. ...

    // C. LLAMAR A LA API DE GEMINI (FORMATO CORREGIDO PARA MEJOR COMPRENSIÓN)
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
            {
                role: "user",
                // ✅ CORRECCIÓN CLAVE: Estructura clara del prompt para Gemini
                parts: [{ 
                    text: `
[ROL]
${systemInstruction}

[INFORMACIÓN DE BÚSQUEDA]
${searchResult}

[PREGUNTA DEL USUARIO]
${prompt}

Respuesta:
                    `
                }] 
            }
        ],
        // ... generaciónConfig ...
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 900 // Asegúrate de que este valor esté en 900
        }
      }),
    });
// ... el resto del código ...
    
    const data = await geminiResponse.json();

    if (data.error) {
        throw new Error(`Error de Gemini: ${data.error.message}`);
    }

    const iaResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Miau... No pude generar una respuesta. Revisa la terminal.";

    res.json({ respuesta: iaResponse });

  } catch (error) {
    console.error("Error en /chat-completo:", error.message);
    res.status(500).json({ error: `Error en la IA o búsqueda: ${error.message}` });
  }
});


// ----------------------------------------------------
// 3. RUTA DE VOZ: /voz (ElevenLabs - CORREGIDO)
// ----------------------------------------------------
app.post("/voz", async (req, res) => {
  try {
    const { texto } = req.body;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ CORRECCIÓN DE SINTAXIS y Clave
        "xi-api-key": ELEVENLABS_API_KEY, 
      },
      body: JSON.stringify({
        text: texto,
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
        },
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs falló con estado ${response.status}: ${errorText}`);
    }

    // Establecer el tipo de contenido para el audio
    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res); // Envía el stream de audio directamente al cliente

  } catch (error) {
    console.error("Error en /voz:", error.message);
    res.status(500).send("Error al generar voz. Revisa tu clave de ElevenLabs o el texto.");
  }
});

// 4. INICIAR EL SERVIDOR
app.listen(PORT, () => {
  console.log(`\n🎉 Servidor Neko IA listo. Puerto: ${PORT}\n`);
});
