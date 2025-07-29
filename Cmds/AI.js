const dreaded = global.dreaded;
const { saveConversation, getRecentMessages, deleteUserHistory } = require('../Database/adapter');
const axios = require("axios");
const fetch = require('node-fetch');
const FormData = require('form-data');
const crypto = require('crypto');
const venicechat = require('../Scrapers/venice.js');
const { gpt } = require('../Scrapers/gpt4o.js');
const { searchai } = require("../Scrapers/searchai.js");

const vertexAI = require('../Scrapers/gemini');


dreaded({
  pattern: "gemini",
  desc: "Ask anything...",
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("provide a question or prompt.");
  }

  const v = new vertexAI();

  try {
    
    const result = await v.chat(text, {
      model: 'gemini-1.5-flash'
    });

    const aiReply = result?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) return m.reply("⚠️ No response received from AI.");

    await client.sendMessage(
      m.chat,
      { text: aiReply },
      { quoted: m }
    );

  } catch (err) {
    console.error("AI error:", err.response?.data || err);
    m.reply("❌ Something went wrong while talking to the AI.");
  }
});

dreaded({
  pattern: "vision",
  desc: "Ask AI about a document or image",
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("provide a question and tag an image or document...");
  }

  const v = new vertexAI();
  let fileBuffer = null;

  
  if (m.quoted && m.quoted.mtype && m.quoted.download) {
    try {
      
      fileBuffer = await m.quoted.download();
    } catch (err) {
      console.error("File download error:", err);
      return m.reply("❌ Failed to download the attached file.");
    }
  }

  try {
    m.reply("🧠 ...analyzing, this may take a while...");

    const result = await v.chat(text, {
      model: 'gemini-1.5-pro',
      file_buffer: fileBuffer
    });

    const aiReply = result?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) return m.reply(" No response received from AI.");

    await client.sendMessage(
      m.chat,
      { text: aiReply },
      { quoted: m }
    );

  } catch (err) {
    console.error("AI error:", err.response?.data || err);
    m.reply("❌ Error while processing your request.");
  }
});

dreaded({
  pattern: "imagine",
  desc: "Imagine command",
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname } = context;

  if (!text) {
    return m.reply("What do you want to imagine?\n\n_Example:_ .imagine beautiful mountains with sunset");
  }

  const ai = new vertexAI();

  try {
    const predictions = await ai.image(text, {
      model: 'imagen-3.0-generate-002',
      aspect_ratio: '9:16'
    });

    const base64 = predictions?.[0]?.bytesBase64Encoded;
    if (!base64) {
      return m.reply("Sorry, I couldn't generate the image. Please try again later.");
    }

    const imageBuffer = Buffer.from(base64, 'base64');

    await client.sendMessage(
      m.chat,
      {
        image: imageBuffer,
        caption: `_Created by: ${botname}_`
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e.response?.data?.error?.message || e.message);
    m.reply("An error occurred while generating the image.");
  }
});

dreaded({
  pattern: "deepsearch",
  desc: "Deep web search and research report",
  alias: ["research"],
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("Provide a query for deepsearch.");
  }

  await m.reply("🔍 Running deep search... This may take a while, please wait...");

  try {
    const result = await searchai(text);

    const agentCaption = `🤖 ${result.metadata.agent_type || 'AI Research Agent'}`;

    const { pdf, docx } = result.files;

    if (pdf) {
      await client.sendMessage(m.chat, {
        document: { url: pdf },
        fileName: "results.pdf",
        caption: agentCaption,
        mimetype: "application/pdf"
      }, { quoted: m });
    }

    if (docx) {
      await client.sendMessage(m.chat, {
        document: { url: docx },
        fileName: "results.docx",
        caption: agentCaption,
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }, { quoted: m });
    }

  } catch (err) {
    m.reply("❌ Something went wrong during deepsearch...\n\n" + err.message);
  }
});

dreaded({
  pattern: "chat",
  desc: "Chat command",
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname, prefix } = context;
  const num = m.sender;

  if (!text) {
    return m.reply(`Provide some text or query for AI chat. Your chats with the AI are stored indefinitely to create context, to delete your chat history send *${prefix}chat --reset*`);
  }

  if (text.toLowerCase().includes('--reset')) {
    await deleteUserHistory(num);
    return m.reply("Conversation history cleared.");
  }

  try {
    await saveConversation(num, 'user', text);

    const recentHistory = await getRecentMessages(num);
    const contextString = recentHistory.map(entry => `${entry.role}: ${entry.message}`).join('\n');

    const fullPrompt = `${contextString}\nuser: ${text.replace('--reset', '').trim()}`;

    const result = await gpt(fullPrompt);

    if (result?.response) {
      await saveConversation(num, 'bot', result.response);
      await m.reply(result.response);
    } else {
      m.reply("Invalid response from AI.");
    }

  } catch (error) {
    console.error(error);
    m.reply("Something went wrong...\n\n" + error.message);
  }
});




dreaded({
  pattern: "darkgpt",
  desc: "Darkgpt command",
  alias: ["wormgpt"],
  category: "AI",
  filename: __filename
}, async (context) => {

  const { client, m, text } = context;

  try {
    if (!text) {
      return m.reply("I am darkgpt, I can respond to anything — even the darkest thoughts. What do you want?");
    }

    const result = await venicechat(text);

    if (!result || !result.response) {
      return m.reply('I did not get any result');
    }

    await m.reply(result.response);

  } catch (e) {
    m.reply('An error occurred while communicating with the Venice scraper:\n' + e.message);
  }
});







dreaded({
  pattern: "gpt",
  desc: "Gpt command",
  alias: ["ai"],
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("Provide some text or query for ChatGPT.");
  }

  try {
    const result = await gpt(text);

    if (result?.response) {
      await m.reply(result.response);
    } else {
      m.reply("Invalid response from AI.");
    }
  } catch (err) {
    m.reply("Something went wrong...\n\n" + err.message);
  }
});










dreaded({
  pattern: "groq",
  desc: "Groq command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text } = context;
  
      if (!text) {
          return m.reply("Prodide a query.");
      }
  
      try {
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "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" });
  
          const model = process.env.GROQ_MODEL || "llama3-8b-8192";
          const systemMessage = process.env.GROQ_SYSTEM_MSG || "Make sure the answer is simple and easy to understand.";
  
          async function getGroqChatCompletion(query) {
              return groq.chat.completions.create({
                  messages: [
                      {
                          role: "system",
                          content: systemMessage,
                      },
                      {
                          role: "user",
                          content: query,
                      },
                  ],
                  model: model,
              });
          }
  
          const chatCompletion = await getGroqChatCompletion(text);
          const content = chatCompletion.choices[0]?.message?.content || "No response received.";
  
          await client.sendMessage(m.chat, { text: content }, { quoted: m });
  
      } catch (error) {
          console.error("Error:", error);
          m.reply("An error occurred.\n" + error);
      }
});





dreaded({
  pattern: "transcribe",
  desc: "Transcribe audio/video to text",
  category: "AI",
  filename: __filename
}, async (context) => {
  const { client, m } = context;
  const quoted = m.quoted || m;
  const mime = (quoted.msg || quoted).mimetype || '';

  if (!/audio|video/.test(mime)) {
    return m.reply('Send or reply to an audio/video file with the caption _transcribe_');
  }

  await m.reply('*Processing, please wait...*');

  try {
    const buffer = await quoted.download();

    if (buffer.length > 5 * 1024 * 1024) {
      return m.reply('⚠️ Maximum file size is 5 MB.');
    }

    const result = await transcribeWithTalknotes(buffer);

    if (!result || !result.text) {
      return m.reply('❌ Failed to extract text. Please try again later.');
    }

    return m.reply(`*Transcription Result:*\n\n${result.text}`);
  } catch (error) {
    console.error(error);
    return m.reply('❌ An error occurred while processing the file.');
  }
});

function generateToken(secretKey) {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(timestamp);
  const token = hmac.digest('hex');

  return {
    'x-timestamp': timestamp,
    'x-token': token
  };
}

async function transcribeWithTalknotes(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg'
    });

    const tokenData = generateToken('w0erw90wr3rnhwoi3rwe98sdfihqio432033we8rhoeiw');

    const headers = {
      ...form.getHeaders(),
      ...tokenData,
      'referer': 'https://talknotes.io/',
      'origin': 'https://talknotes.io',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
    };

    const { data } = await axios.post('https://api.talknotes.io/tools/converter', form, { headers });

    return data;
  } catch (err) {
    console.error('Talknotes error:', err.message);
    return null;
  }
}


