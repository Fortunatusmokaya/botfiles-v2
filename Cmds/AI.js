const dreaded = global.dreaded;
const { saveConversation, getRecentMessages, deleteUserHistory } = require('../Database/adapter');
const axios = require("axios");
const fetch = require('node-fetch');
const FormData = require('form-data');
const crypto = require('crypto');

dreaded({
  pattern: "aicode",
  desc: "Aicode command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, botname, fetchJson, prefix } = context;
      const num = m.sender; 
  
      if (!text) return m.reply(`Provide a prompt and a programming language. Usage: ${prefix}aicode <language> <prompt>`);
  
      const [language, ...promptArr] = text.split(' ');
      const prompt = promptArr.join(' ');
  
      if (!language || !prompt) {
          return m.reply(`Please provide both a language and a prompt. Example: *${prefix}aicode python 'Create a Hello World program*`);
      }
  
      try {
          
          const response = await fetchJson(`https://api.dreaded.site/api/aicode?prompt=${encodeURIComponent(prompt)}&language=${language.toLowerCase()}`);
  
          if (response.success) {
              const { code, language } = response.result;
              m.reply(`Here is your code in ${language}:\n\n${code}`);
          } else {
              m.reply("There was an issue generating the code. Please check your prompt and language.");
          }
      } catch (error) {
          console.error(error);
          m.reply("Something went wrong while fetching the code.");
      }
});


dreaded({
  pattern: "aisearch",
  desc: "Aisearch command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, botname, fetchJson } = context;
  
      if (!text) {
          return m.reply("Provide some text or query. This AI will search and summarize results from Google.");
      }
  
      try {
          const data = await fetchJson(`https://api.dreaded.site/api/aisearch?query=${text}`);
  
          if (data && data.result) {
              const res = data.result;
              await m.reply(res);
          } else {
              m.reply("Invalid response from the API.");
          }
      } catch (error) {
          m.reply("An error occurred while connecting to the API. Please try again.\n" + error);
      }
});


dreaded({
  pattern: "chat",
  desc: "Chat command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
   
  
  
      const { client, m, text, botname, fetchJson, prefix } = context;
      const num = m.sender;
  
      if (!text) return m.reply(`Provide some text or query for AI chat. Your chats with the AI are stored indefinitely to create context, to delete your chat history send *${prefix}chat --reset*`);
  
      
      if (text.toLowerCase().includes('--reset')) {
          await deleteUserHistory(num);
          return m.reply("Conversation history cleared.");
      }
  
      try {
          await saveConversation(num, 'user', text);
  
          const recentHistory = await getRecentMessages(num);
          const contextString = recentHistory.map(entry => `${entry.role}: ${entry.message}`).join('\n');
  
          const queryWithContext = encodeURIComponent(`${contextString}\nuser: ${text.replace('--reset', '').trim()}`);
          const data = await fetchJson(`https://api.dreaded.site/api/aichat?query=${queryWithContext}`);
  
          const response = data?.result || "I'm not sure how to respond to that.";
  
          await saveConversation(num, 'bot', response);
          await m.reply(response);
  
      } catch (error) {
          console.error(error);
          m.reply("Something went wrong...\n\n" + error.message);
      }
});


dreaded({
  pattern: "codegen",
  desc: "Codegen command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, m, text } = context;
  
      if (!text) {
          return m.reply("Example usage:\n.codegen Function to calculate triangle area|Python");
      }
  
      let [prompt, language] = text.split("|").map(v => v.trim());
  
      if (!prompt || !language) {
          return m.reply(
              "Invalid format!\nUse the format:\n.codegen <prompt>|<language>\n\n" +
              "Example:\n.codegen Check for prime number|JavaScript"
          );
      }
  
      try {
          const payload = {
              customInstructions: prompt,
              outputLang: language
          };
  
          const { data } = await axios.post("https://www.codeconvert.ai/api/generate-code", payload);
  
          if (!data || typeof data !== "string") {
              return m.reply("Failed to retrieve code from API.");
          }
  
          m.reply(
              `*Generated Code (${language}):*\n` +
              "```" + language.toLowerCase() + "\n" +
              data.trim() +
              "\n```"
          );
  
      } catch (error) {
          console.error(error);
          m.reply("An error occurred while processing your request.");
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
              return m.reply("I am darkgpt, I can respond to anything — even the darkest thoughts. What do you want ?");
          }
  
          const msg = encodeURIComponent(text);
          const response = await fetch(`http://darkgpt.dreaded.site:3800/api/venice?text=${msg}`);
  
          const result = await response.json();
  
          if (!result.response) {
              return m.reply('I did not get any result');
          }
  
          await m.reply(result.response);
  
      } catch (e) {
          m.reply('An error occurred while communicating with the Venice API:\n' + e);
      }
});


dreaded({
  pattern: "gemini",
  desc: "Gemini command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
      if (!text) {
          return m.reply("What's your question?");
      }
  
      try {
          const data = await fetchJson(`https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(text)}`);
  
          if (data.success) {
              const res = data.result;
              await m.reply(res);
          } else {
              await m.reply("Failed to get a response from the API.");
          }
  
      } catch (e) {
          console.log(e);
          m.reply("An error occurred while processing your request.");
      }
});


dreaded({
  pattern: "gpt",
  desc: "Gpt command",
alias: ["ai"],
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, botname, fetchJson } = context;
  
      if (!text) {
          return m.reply("Provide some text or query for chatgpt.");
      }
  
  try {
  
  const data = await fetchJson(`https://api.dreaded.site/api/chatgpt?text=${text}`);
  
  if (data && data.result && data.result.prompt) {
  
  const res = data.result.prompt;
  await m.reply(res);
  
  } else {
  
  m.reply("Invalid response from API")
  
  }
  
  } catch (error) {
  
  m.reply("Something went wrong...\n\n" + error)
  
  }
});


dreaded({
  pattern: "gpt2",
  desc: "Gpt2 command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
      if (!text) {
          return m.reply("What's your question?");
      }
  
      try {
          const data = await fetchJson(`https://api.dreaded.site/api/gpt?text=${encodeURIComponent(text)}`);
  
          if (data.success) {
              const res = data.result;
              await m.reply(res);
          } else {
              await m.reply("Failed to get a response from the API.");
          }
  
      } catch (e) {
          console.log(e);
          m.reply("An error occurred while processing your request.");
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
  pattern: "imagine",
  desc: "Imagine command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, m, text, fetchJson, botname } = context;
  
      if (!text) return m.reply("What do you want to imagine?\n\n_Example:_ .imagine beautiful mountains with sunset");
  
      const apiUrl = `https://api.dreaded.site/api/imagine?text=${encodeURIComponent(text)}`;
  
      try {
          const data = await fetchJson(apiUrl);
  
          if (!data.status || !data.result) {
              return m.reply("Sorry, I couldn't generate the image. Please try again later.");
          }
  
          const { creator, result } = data;
          const caption = `_Created by: ${botname}_`;
  
          await client.sendMessage(
              m.chat,
              {
                  image: { url: result },
                  caption: caption
              },
              { quoted: m }
          );
      } catch (error) {
          console.error(error);
          m.reply("An error occurred while generating the image.");
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


dreaded({
  pattern: "vision",
  desc: "Vision command",
  category: "AI",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, mime, m, text, botname } = context;
  
      if (m.quoted && text) {
          const buffer = await m.quoted.download();
  
  
          if (!/image|pdf/.test(mime)) return m.reply("That's neither an image nor a PDF, quote a PDF document or an image with instructions.");
  
          const query = text;
          const base64String = buffer.toString('base64');
  
          await m.reply(`A moment, dreaded is analyzing the contents of the ${mime.includes("pdf") ? "PDF document" : "image"} you provided...`);
  
          try {
              const response = await axios.post('https://api.dreaded.site/api/gemini-analyze', {
                  query: query,
                  imageBuffer: base64String
              }, {
                  headers: {
                      'Content-Type': 'application/json'  
                  }
              });
  
              console.log(response.data);
              await m.reply(response.data.result);
          } catch (error) {
              const errorMessage = error.message || 'An unknown error occurred.';
              const maxErrorLength = 200;
              const replyMessage = errorMessage.length > maxErrorLength
                  ? errorMessage.substring(0, maxErrorLength) + '...'
                  : errorMessage;
  
              console.error("Error in sending request:", error);
              await m.reply(replyMessage);
          }
      } else {
          m.reply("Quote a PDF or image with instructions for bot to analyse.");
      }
});
