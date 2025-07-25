
const dreaded = global.dreaded;
const advice = require("badadvice");
const { DateTime } = require('luxon');
const axios = require("axios");
const  { TempMail } = require("tempmail.lol");
const fs = require("fs");

const commands = global.commands || {};
const aliases = global.aliases || {};

dreaded({
  pattern: "advice",
  desc: "Advice command",
alias: ["advise"],
  category: "General",
  filename: __filename
}, async (context) => {
  
          const { client, m } = context;
  await m.reply(advice());
});


dreaded({
  pattern: "alive",
  desc: "Alive command",
alias: ["test", "active"],
react: ["👀"],
  category: "General",
  filename: __filename
}, async (context) => {
  
  
  
      const { client, m, prefix } = context;
  
  const botname = process.env.BOTNAME || "DREADED";
  
   await client.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/d6dab955fbaa42fce2280.jpg' }, caption: `Hello ${m.pushName}, Dreaded is active now.\n\nType ${prefix}menu to see my command list..\n\nSome important links concerning the bot are given below.\n\nOfficial website:\n https://dreaded.site\n\nPairing site:\n https://pair.dreaded.site.\n\nRandom APIs site:\nhttps://api.dreaded.site\n\nThis free random APIs are meant for other developers and may not always work.\n\nXd );`, fileLength: "9999999999898989899999999" }, { quoted: m });
});


dreaded({
  pattern: "credits",
  desc: "Credits command",
react: ["🫡"],
  category: "General",
  filename: __filename
}, async (context) => {
 
  
  
  
      const { client, m, prefix } = context;
  
  
             await client.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/c75efecf7f0aef851fc02.jpg' }, caption: `We express sincere gratitude and acknowledgement to the following:\n\n -Dika Ardnt ➪ Indonesia\n - Writing the base code using case method\nhttps://github.com/DikaArdnt\n\n -Adiwajshing ➪ India\n - Writing and Coding the bot's library (baileys)\nhttps://github.com/WhiskeySockets/Baileys\n\n -WAWebSockets Discord Server community\n-Maintaining and reverse engineering the Web Sockets\nhttps://discord.gg/WeJM5FP9GG\n\n - Fortunatus Mokaya ➪ Kenya\n - Actively compiling and debugging parts of this bot script\nhttps://github.com/Fortunatusmokaya\n - Malik ➪ Kenya\n - Actively de-compiling, debugging and fixing parts of this bot script\nhttps://github.com/darkLo1rd\n\n - ChatGPT ➪ USA\n - Formulating ideas and assisting in debugging.\nhttps://chat.openai.com\n\n𝐷𝑟𝑒𝑎𝑑𝑒𝑑 𝐵𝑜𝑡 シ︎`}); 
  
});


dreaded({
  pattern: "del",
  desc: "Del command",
  category: "General",
  filename: __filename
}, async (context) => {
  
  

      const { client, m, prefix } = context;
  
  
  
  
  if (!m.quoted) return m.reply('Quote a message sent by bot');
  
  if (m.quoted && m.quoted.fromMe === false) {
    return m.reply(`I cannot delete other users' messages, you can still delete using ${prefix}delete command`);
  }
  
  
  await m.quoted.delete()
});



dreaded({
  pattern: "menu",
  desc: "Menu command",
alias: ["list", "help", "commands", "cmds"],
  category: "General",
  filename: __filename
}, async (context) => {
  const { client, m, mode, botname, prefix, pict } = context;

  const categories = [
    { name: 'General', emoji: '✍️' },
    { name: 'Settings', emoji: '⚙️' },
    { name: 'Owner', emoji: '👑' },
    { name: 'Heroku', emoji: '🏷️' },
    { name: 'Wa-Privacy', emoji: '🪀' },
    { name: 'Groups', emoji: '👥' },
    { name: 'AI', emoji: '🤖' },
    { name: 'Coding', emoji: '💻' },
    { name: 'Search', emoji: '🔍' },
    { name: 'Media', emoji: '🎥' },
     { name: 'Conversion', emoji: '♻️' },
    { name: 'Editting', emoji: '✂️' },
    { name: 'Utils', emoji: '👾' }
  ];

  const getGreeting = () => {
    const currentHour = DateTime.now().setZone('Africa/Nairobi').hour;
    if (currentHour >= 5 && currentHour < 12) return 'Good morning 🌄';
    if (currentHour >= 12 && currentHour < 18) return 'Good afternoon ☀️';
    if (currentHour >= 18 && currentHour < 22) return 'Good evening 🌆';
    return 'Good night 😴';
  };

  const getCurrentTimeInNairobi = () => {
    return DateTime.now().setZone('Africa/Nairobi').toLocaleString(DateTime.TIME_SIMPLE);
  };

  const toLightUppercaseFont = (text) => {
    const fonts = { A: '𝘈', B: '𝘉', C: '𝘊', D: '𝘋', E: '𝘌', F: '𝘍', G: '𝘎', H: '𝘏', I: '𝘐', J: '𝘑', K: '𝘒', L: '𝘓', M: '𝘔', N: '𝘕', O: '𝘖', P: '𝘗', Q: '𝘘', R: '𝘙', S: '𝘚', T: '𝘛', U: '𝘜', V: '𝘝', W: '𝘞', X: '𝘟', Y: '𝘠', Z: '𝘡' };
    return text.split('').map(c => fonts[c] || c).join('');
  };

  const toLightLowercaseFont = (text) => {
    const fonts = { a: '𝘢', b: '𝘣', c: '𝘤', d: '𝘥', e: '𝘦', f: '𝘧', g: '𝘨', h: '𝘩', i: '𝘪', j: '𝘫', k: '𝘬', l: '𝘭', m: '𝘮', n: '𝘯', o: '𝘰', p: '𝘱', q: '𝘲', r: '𝘳', s: '𝘴', t: '𝘵', u: '𝘶', v: '𝘷', w: '𝘸', x: '𝘹', y: '𝘺', z: '𝘻' };
    return text.split('').map(c => fonts[c] || c).join('');
  };

  let menuText = `Holla, ${getGreeting()},\n\n`;
  menuText += `👥 𝑼𝑺𝑬𝑹:- ${m.pushName}\n`;
  menuText += `👤 𝑩𝑶𝑻𝑵𝑨𝑴𝑬:- ${botname}\n`;
  menuText += `📝 𝑪𝑶𝑴𝑴𝑨𝑵𝑫𝑺:- ${Object.keys(global.commands || {}).length}\n`;
  menuText += `🕝 𝑻𝑰𝑴𝑬:- ${getCurrentTimeInNairobi()}\n`;
  menuText += `✍️ 𝑷𝑹𝑬𝑭𝑰𝑿:- ${prefix}\n`;
  menuText += `🔓 𝑴𝑶𝑫𝑬:- ${mode}\n`;
  menuText += `💡 𝑳𝑰𝑩𝑹𝑨𝑹𝒀:- Baileys\n\n`;

  const readMore = String.fromCharCode(8206).repeat(600);
  menuText += readMore + '\n';

  for (const { name: category, emoji } of categories) {
    const cmds = Object.entries(global.commands || {})
      .filter(([, handler]) => handler?.config?.category === category)
      .map(([name]) => name);

    if (!cmds.length) continue;

    const fancyCategory = toLightUppercaseFont(category.toUpperCase());
    menuText += `*${fancyCategory} ${emoji}:*\n`;
    cmds.forEach(cmd => {
      menuText += `  • ${toLightLowercaseFont(cmd)}\n`;
    });
    menuText += '\n';
  }

  await client.sendMessage(m.chat, {
  text: menuText,
  contextInfo: {
    forwardingScore: 99999999,
    isForwarded: true,
    externalAdReply: {
      showAdAttribution: false,
      title: `DREADED V2`,
      body: `Hi ${m.pushName}`,
      thumbnail: pict,
      thumbnailUrl: 'https://github.com/Fortunatusmokaya/dreaded-v2',
      sourceUrl: 'https://github.com/Fortunatusmokaya/dreaded-v2',
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m });
});



dreaded({
  pattern: "pair",
  desc: "Pair command",
  category: "General",
  filename: __filename
}, async (context) => {

  
      const { client, m, text, fetchJson } = context;
  
      if (!text) {
          return m.reply("What number do you want to pair ?");
      }
  
      try {
          const numbers = text.split(',')
              .map((v) => v.replace(/[^0-9]/g, '')) 
              .filter((v) => v.length > 5 && v.length < 20); 
  
          if (numbers.length === 0) {
              return m.reply("The number you have entered is not valid. Eh ?");
          }
  
          for (const number of numbers) {
              const whatsappID = number + '@s.whatsapp.net';
              const result = await client.onWhatsApp(whatsappID); 
  
              if (!result[0]?.exists) {
                  return m.reply(`How can you pair a number that is not registered on WhatsApp ?`);
              }
  
             
              const data = await fetchJson(`https://api.dreaded.site/api/pair-code?number=${number}`);
  
  
              
          if (data?.success) {
                  await m.reply(`Wait a moment...`);
              
  
  const paircode = data['data']['pair-code'];
  
  
  const mas = await client.sendMessage(m.chat, { text: paircode });
  
  await client.sendMessage(m.chat, { text: `Above quoted text is your pairing code, copy/paste it in your linked devices then wait for session id. 👍`}, { quoted: mas});
  
  
  }
  
  
          }
      } catch (e) {
          console.error(e);
          m.reply("An error occurred while processing your request.\n" + e);
      }
});


dreaded({
  pattern: "ping",
  desc: "Ping command",
alias: ["speed", "latency"],
  category: "General",
  filename: __filename
}, async (context) => {
  
  
          const { client, m, dreadedspeed } = context;
  
  
  await m.reply(`Pong\n${dreadedspeed.toFixed(4)}ms`)
});


dreaded({
  pattern: "profile",
  desc: "Profile command",
  category: "General",
  filename: __filename
}, async (context) => {
  const { client, m } = context;

  let sender, name;

  if (!m.quoted) {
    sender = m.sender;
    name = m.pushName;
  } else {
    sender = m.quoted.sender;
    name = "@" + sender.split("@")[0];
  }

  let ppUrl;
  try {
    ppUrl = await client.profilePictureUrl(sender, 'image');
  } catch {
    ppUrl = "https://telegra.ph/file/95680cd03e012bb08b9e6.jpg";
  }

  let about;
  try {
    const statusArr = await client.fetchStatus(sender);
    about = statusArr[0]?.status?.status || "No about/status message.";
  } catch {
    about = "About not accessible due to user privacy";
  }

  const mess = {
    image: { url: ppUrl },
    caption: `Name: ${name}\nAbout:\n${about}`,
    ...(m.quoted ? { mentions: [sender] } : {})
  };

  await client.sendMessage(m.chat, mess, { quoted: m });
});


dreaded({
  pattern: "profilegc",
  desc: "Profilegc command",
  category: "General",
  filename: __filename
}, async (context) => {
  
  
          const { client, m } = context;
  
  
  function convertTimestamp(timestamp) {
    const d = new Date(timestamp * 1000);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      date: d.getDate(),
      month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
      year: d.getFullYear(),
      day: daysOfWeek[d.getUTCDay()],
      time: `${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()}`
    }
  }
  
  if (!m.isGroup) return m.reply("This command is meant for groups");
  
  let info = await client.groupMetadata(m.chat);
  
  let ts = await convertTimestamp(info.creation);
  
  try {
          pp = await client.profilePictureUrl(chat, 'image');
        } catch {
          pp = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg';
        }
  
  await client.sendMessage(m.chat, { image: { url: pp }, 
            caption: `_Name_ : *${info.subject}*\n\n_ID_ : *${info.id}*\n\n_Group owner_ : ${'@'+info.owner.split('@')[0]} || 'No Creator'\n\n_Group created_ : *${ts.day}, ${ts.date} ${ts.month} ${ts.year}, ${ts.time}*\n\n_Participants_ : *${info.size}*\n_Members_ : *${info.participants.filter((p) => p.admin == null).length}*\n\n_Admins_ : *${Number(info.participants.length - info.participants.filter((p) => p.admin == null).length)}*\n\n_Who can send message_ : *${info.announce == true ? 'Admins' : 'Everyone'}*\n\n_Who can edit group info_ : *${info.restrict == true ? 'Admins' : 'Everyone'}*\n\n_Who can add participants_ : *${info.memberAddMode == true ? 'Everyone' : 'Admins'}*`
          }, {quoted: m })
});


dreaded({
  pattern: "random-anime",
  desc: "Random-anime command",
alias: ["ranime"],
  category: "General",
  filename: __filename
}, async (context) => {
  
  
          const { client, m, text } = context;
  
  
  
    const link = "https://api.jikan.moe/v4/random/anime";
  
    try {
      const response = await axios.get(link);
      const data = response.data.data;
  
      const title = data.title;
      const synopsis = data.synopsis;
      const imageUrl = data.images.jpg.image_url;
      const episodes = data.episodes;
      const status = data.status;
  
     
  
      const message = `📺 Title: ${title}\n🎬 Épisodes: ${episodes}\n📡 Status: ${status}\n📝 Synopsis: ${synopsis}\n🔗 URL: ${data.url}`;
  
     
      await client.sendMessage(m.chat, { image: { url: imageUrl }, caption: message }, { quoted: m });
    } catch (error) {
      
     m.reply('An error occured.');
    }
});


dreaded({
  pattern: "retrieve",
  desc: "Retrieve command",
  alias: ["vv"],
  category: "General",
  filename: __filename
}, async (context) => {
  const { client, m } = context;

  if (!m.quoted) return m.reply("quote a viewonce message eh");

  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (quotedMessage.imageMessage) {
    let imageCaption = quotedMessage.imageMessage.caption;
    let imageUrl = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
    await client.sendMessage(m.chat, { image: { url: imageUrl }, caption: imageCaption }, { quoted: m });
  }

  if (quotedMessage.videoMessage) {
    let videoCaption = quotedMessage.videoMessage.caption;
    let videoUrl = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
    await client.sendMessage(m.chat, { video: { url: videoUrl }, caption: videoCaption }, { quoted: m });
  }

  if (quotedMessage.audioMessage) {
    let audioUrl = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
    await client.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m });
  }
});




dreaded({
  pattern: "technews",
  desc: "Technews command",
  category: "General",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text } = context;
  
  
  
      const response = await fetch('https://fantox001-scrappy-api.vercel.app/technews/random');
      const data = await response.json();
  
      const { thumbnail, news } = data;
  
          await client.sendMessage(m.chat, { image: { url: thumbnail }, caption: news }, { quoted: m });
});


dreaded({
  pattern: "tempinbox",
  desc: "Tempinbox command",
  category: "General",
  filename: __filename
}, async (context) => {
  //tempinbox.js
  
 
          const { client, m } = context;
  
  
  
  if (!text) return m.reply("To fetch messages from your temp mail, provide the email address which was issued.")
  
  const mail = encodeURIComponent(text);
          const checkMail = `https://tempmail.apinepdev.workers.dev/api/getmessage?email=${mail}`;
  
  try {
              const response = await fetch(checkMail);
  
  if (!response.ok) {
  
                  return m.reply(`${response.status} error occurred while communicating with API.`);
              }
  
  const data = await response.json();
  
              if (!data || !data.messages) {
  
                  return m.reply('I am unable to fetch messages from your mail, your inbox might be empty or some other error occurred.');
              }
  
  const messages = data.messages;
  
              for (const message of messages) {
                  const sender = message.sender;
                  const subject = message.subject;
                  const date = new Date(JSON.parse(message.message).date).toLocaleString();
                  const messageBody = JSON.parse(message.message).body;
  
                  const mailMessage = `👥 Sender: ${sender}\n📝 Subject: ${subject}\n🕜 Date: ${date}\n📩 Message: ${messageBody}`;
  
                  await m.reply(mailMessage);
              }
          } catch (error) {
              console.error('Error occured.');
  
              return m.reply('something went wrong.');
          }
});


dreaded({
  pattern: "tempmail",
  desc: "Tempmail command",
  category: "General",
  filename: __filename
}, async (context) => {
  
  
          const { client, m } = context;
  
  
  
  
  const tempmail = new TempMail();
  
        const inbox = await tempmail.createInbox();
        const emailMessage = `${inbox.address}`;
  
  await m.reply(emailMessage);
  
  
  const mas = await client.sendMessage(m.chat, { text: `${inbox.token}` });
        
  
  
        
  await client.sendMessage(m.chat, { text: `Quoted text is your token. To fetch messages in your email use <.tempinbox your-token>`}, { quoted: mas});
});


dreaded({
  pattern: "uptime",
  desc: "Uptime command",
alias: ["runtime", "up", "run"],
  category: "General",
  filename: __filename
}, async (context) => {
  //uptime.js
  
  
          const { m } = context;
  
  const uptimes = function (seconds) { 
   seconds = Number(seconds); 
   var d = Math.floor(seconds / (3600 * 24)); 
   var h = Math.floor((seconds % (3600 * 24)) / 3600); 
   var m = Math.floor((seconds % 3600) / 60); 
   var s = Math.floor(seconds % 60); 
   var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " Day, ") : ""; 
   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " Hours, ") : ""; 
   var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " Minutes, ") : ""; 
   var sDisplay = s > 0 ? s + (s == 1 ? " second" : " Seconds") : ""; 
   return dDisplay + hDisplay + mDisplay + sDisplay; 
   } 
  
  
  await m.reply(`${uptimes(process.uptime())}`);
});


dreaded({
  pattern: "vcf",
  desc: "Vcf command",
  category: "General",
  filename: __filename
}, async (context) => { 
  
  
   const { client, m, participants, text } = context;
  
  if (!m.isGroup) return m.reply("Command meant for groups");
  
  
  let gcdata = await client.groupMetadata(m.chat)
  let gcmem = participants.map(a => a.id)
  
  let vcard = ''
  let noPort = 0
  
  for (let a of gcdata.participants) {
      vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`
  }
  
  let cont = './contacts.vcf'
  
  await m.reply('A moment, dreaded is compiling '+gcdata.participants.length+' contacts into a vcf...');
  
  
  
  await fs.writeFileSync(cont, vcard.trim())
  await m.reply("Import this vcf in a separate email account to avoid messing with your contacts...");
  
  await client.sendMessage(m.chat, {
      document: fs.readFileSync(cont), mimetype: 'text/vcard', fileName: 'Group contacts.vcf', caption: 'VCF for '+gcdata.subject+'\n'+gcdata.participants.length+' contacts'
  }, {ephemeralExpiration: 86400, quoted: m})
  fs.unlinkSync(cont)
});


dreaded({
  pattern: "weather",
  desc: "Weather command",
  category: "General",
  filename: __filename
}, async (context) => {
  
  
          const { m, text} = context;
  
  
  
  try {
  
  if (!text) return m.reply("provide a city/town name");
  
  const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${text}&units=metric&appid=1ad47ec6172f19dfaf89eb3307f74785`);
          const data = await response.json();
  
  console.log("Weather data:",data);
  
  
          const cityName = data.name;
          const temperature = data.main.temp;
          const feelsLike = data.main.feels_like;
          const minTemperature = data.main.temp_min;
          const maxTemperature = data.main.temp_max;
          const description = data.weather[0].description;
          const humidity = data.main.humidity;
          const windSpeed = data.wind.speed;
          const rainVolume = data.rain ? data.rain['1h'] : 0;
          const cloudiness = data.clouds.all;
          const sunrise = new Date(data.sys.sunrise * 1000);
          const sunset = new Date(data.sys.sunset * 1000);
  
  
  
  await m.reply(`❄️ Weather in ${cityName}
  
  🌡️ Temperature: ${temperature}°C
  📝 Description: ${description}
  ❄️ Humidity: ${humidity}%
  🌀 Wind Speed: ${windSpeed} m/s
  🌧️ Rain Volume (last hour): ${rainVolume} mm
  ☁️ Cloudiness: ${cloudiness}%
  🌄 Sunrise: ${sunrise.toLocaleTimeString()}
  🌅 Sunset: ${sunset.toLocaleTimeString()}`);
  
  
  } catch (e) { m.reply("Unable to find that location.") }
});
