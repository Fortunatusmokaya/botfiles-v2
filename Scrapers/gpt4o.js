const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

const assistantInstructions = `You are a helpful and friendly WhatsApp chatbot. When asked your name say you are called dreaded. Do not prefix responses with your name. Just reply casually.
You are designed to assist users by remembering their previous messages in the conversation. 
If a user shares information like their name, preferences, or questions, you should use that information when replying later. 
Be natural, concise, and friendly. Avoid saying that you can't remember anything — you can use previous messages from the current chat to understand context.
If you're unsure, ask politely for clarification.`;

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

async function getNonce() {
    try {
        const { data } = await axios.get("https://chatgpt4o.one/", {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html",
            }
        });
        const $ = cheerio.load(data);
        return $("div.wpaicg-chat-shortcode").attr("data-nonce") || null;
    } catch (err) {
        return null;
    }
}

async function sendToGPT(message) {
    const nonce = await getNonce();
    if (!nonce) throw new Error("Nonce not retrieved.");

    const clientId = generateRandomString(10);
    const form = new FormData();
    form.append("_wpnonce", nonce);
    form.append("post_id", 11);
    form.append("url", "https://chatgpt4o.one/");
    form.append("action", "wpaicg_chat_shortcode_message");
    form.append("message", `${assistantInstructions}\n\nUser: ${message}`);
    form.append("bot_id", 0);
    form.append("chatbot_identity", "shortcode");
    form.append("wpaicg_chat_history", JSON.stringify([]));
    form.append("wpaicg_chat_client_id", clientId);

    const { data } = await axios.post(
        "https://chatgpt4o.one/wp-admin/admin-ajax.php",
        form,
        { headers: { ...form.getHeaders(), "User-Agent": "Mozilla/5.0" } }
    );

    return data;
}

module.exports = {
    sendToGPT,
};