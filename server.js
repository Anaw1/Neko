// server.js (CÓDIGO FINAL DE SERVIDOR - SOLO API DE TEXTO)

import express from "express"; 
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { buscarEnGoogle } from './serper.js'; 

// --- INICIALIZACIÓN CLAVE ---
const app = express();
const PORT = process.env.PORT || 3000;
// -----------------------------

// --- CONFIGURACIÓN DE CLAVES ---
// ✅ Correcto: Lectura desde las variables de Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; 
const SERPER_API_KEY = process.env.SERPER_API_KEY; 
const VOICE_ID = "htFfPSZGJwjBv1CL0aMD"; 
// -------------------------------------------------------------------------

// ✅ CORRECCIÓN CORS: Permite que el archivo HTML local se conecte
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());

// ... (Resto del código de inicialización de rutas estáticas) ...

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ----------------------------------------------------
// 2. RUTA CENTRAL DE CHAT: /chat-completo (GEMINI)
// ----------------------------------------------------
app.post("/chat-completo", async (req, res) => {
    const { prompt } = req.body;

    try {
        const searchResult = await buscarEnGoogle(prompt);

        const systemInstruction = `
            Eres Neko, un útil asistente de chat.
            Tu rol es responder a la pregunta del usuario.
            UTILIZA la información proporcionada en el bloque [INFORMACIÓN DE BÚSQUEDA] para dar una respuesta precisa. 
            Si la información de búsqueda es inútil o no es relevante, puedes usar tu conocimiento general.
            Tu respuesta debe ser muy concisa, no debe superar las 100 palabras.
            NO DEBES citar textualmente la fuente. Usa tus propias palabras.
            Si la pregunta es un saludo básico, ignora la búsqueda y responde amigablemente.
        `; 
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
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
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 900
                }
            }),
        });
        
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
// 3. RUTA DE VOZ: /voz (DESACTIVADA)
// ----------------------------------------------------
// Esta ruta ya no será llamada por elevenlabs.js, pero se mantiene para evitar un 404
app.post("/voz", (req, res) => {
    res.status(501).send("Voz desactivada. Usando la voz nativa del navegador.");
});

// 4. INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`\n🎉 Servidor Neko IA listo. Puerto: ${PORT}\n`);
});