const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Event listeners para enviar el mensaje
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

const nombreGatito = "Neko";
const fotoGatito = "gatito.jpg"; // imagen en la carpeta avatar


// --- Función de utilidad para respuestas predefinidas ---
function parecidas(texto, palabrasClave) {
    return palabrasClave.some(palabra => texto.includes(palabra));
}

// ------------------------------------------------------------------
// Función principal que genera la respuesta (con lógica de saludos y API)
// ------------------------------------------------------------------
async function generarRespuesta(pregunta) {
    const lower = pregunta.toLowerCase();

    // 1. LÓGICA DE SALUDOS BÁSICOS (Respuestas inmediatas)
    if (parecidas(lower, ["hola", "holaa", "ola"])) return "¡Hola! 🌸 Qué gusto verte por aquí.";
    if (parecidas(lower, ["como estas", "cómo estás"])) return "Estoy muy bien, gracias 💕 ¿Y tú?";
    if (parecidas(lower, ["quien eres", "que eres"])) return "Soy Neko, tu gatito IA 🐾. ¡Estoy aquí para responder cualquier pregunta!";
    if (parecidas(lower, ["gracias"])) return "De nada, ¡para eso estoy! 🥰";
    if (parecidas(lower, ["te quiero", "te amo"])) return "Awww 💖 yo también te quiero~";
    
    // Si no es un saludo básico, procede a la búsqueda en Internet y a la IA
    try {
        // 2. Lógica de IA + Búsqueda en Internet (Llama a la ruta en server.js)
        const response = await fetch("https://neko-jgqp.onrender.com/chat-completo", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: pregunta })
        });

        if (!response.ok) {
            // Manejo de error si el servidor no responde correctamente
            return "Miau... no pude contactar a mi servidor de inteligencia. ¿Está el servidor corriendo? 😿";
        }
        
        const data = await response.json();

        if (data.error) {
            console.error("Error del servidor:", data.error);
            return data.error; 
        }

        // Devolvemos el texto de la respuesta (de internet)
        return data.respuesta;
        
    } catch (error) {
        console.error("Error al generar la respuesta:", error);
        return "¡Miau! Hubo un problema al contactar a mi cerebro. ¿Está el servidor Express corriendo? 😿";
    }
}


// --- Función principal para enviar mensajes (mantiene el efecto escribiendo) ---
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage("user", message);
    userInput.value = "";

    // 1. INICIO DEL EFECTO ESCRIBIENDO
    const typingContainer = document.createElement("div");
    typingContainer.className = "bot-message typing";
    typingContainer.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    chatBox.appendChild(typingContainer);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simular un pequeño retraso para que se vea el efecto
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // 2. Obtener la respuesta (ya sea rápida o de internet)
    const botResponse = await generarRespuesta(message);
    
    // 3. QUITAR el efecto escribiendo
    typingContainer.remove();

    // 4. Mostrar la respuesta
    addMessage("bot", botResponse);
    
    // 5. HACER QUE HABLE (Llama a la función de elevenlabs.js)
    if (typeof hablarConVoz === 'function') {
        hablarConVoz(botResponse);
    } else {
        console.warn("Advertencia: La función hablarConVoz no está definida. Revisa si elevenlabs.js está cargado correctamente.");
    }
}


// --- FUNCIONES DE INTERFAZ (UI) ---
// script.js (Función addMessage corregida para usar el avatar)

function addMessage(sender, text) {
    
    // 1. Crear el contenedor principal de la línea de chat
    const messageContainer = document.createElement("div"); 
    messageContainer.className = "message-container";

    // 2. Crear la burbuja de texto
    const messageElement = document.createElement("div");
    messageElement.className = `${sender}-message`;
    messageElement.innerText = text;

    if (sender === "bot") {
        // 3. Si es el bot: añadir el avatar al inicio
        const avatar = document.createElement("img");
        // Asegúrate de que esta línea apunte a tu nueva imagen si la renombraste.
        // Ej: image_15ed21.jpg si no renombraste.
        avatar.src = fotoGatito; 
        avatar.alt = nombreGatito;
        avatar.className = "avatar";
        
        // El contenedor del bot se alinea a la izquierda por defecto (message-container)
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(messageElement);
    } else {
        // 4. Si es el usuario: alineamos el contenedor a la derecha
        messageContainer.className = "message-container user-message-container";
        // Añadimos solo la burbuja
        messageContainer.appendChild(messageElement);
    }

    chatBox.appendChild(messageContainer);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- LÓGICA DE SALUDO INICIAL DE LA IA ---
async function iniciarChatConSaludo() {
    const saludo = "¡Miau! Soy Neko, tu gatito IA. Estoy aquí para ayudarte 🐾";
// Dentro de iniciarChatConSaludo()
hablarConVoz(saludo);

    // 1. INICIO DEL EFECTO ESCRIBIENDO
    const typingContainer = document.createElement("div");
    typingContainer.className = "bot-message typing";
    typingContainer.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    chatBox.appendChild(typingContainer);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simular un retraso para que el usuario vea que la IA está "pensando"
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 2. QUITAR el efecto escribiendo
    typingContainer.remove();

    // 3. Mostrar el saludo
    addMessage("bot", saludo);

    // 4. HACER QUE HABLE
    if (typeof hablarConVoz === 'function') {
        hablarConVoz(saludo);
    }
}

// 💥 Ejecuta la función de saludo cuando el script se carga
window.onload = iniciarChatConSaludo;