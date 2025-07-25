const dreaded = global.dreaded;
const axios = require("axios");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const wiki = require('wikipedia');

dreaded({
  pattern: "github",
  desc: "Github command",
  category: "Search",
  filename: __filename
}, async ({ client, m, text }) => {
  try {
    if (!text) return m.reply("Provide a GitHub username!");

    const response = await fetch(`https://api.github.com/users/${text}`);
    const data = await response.json();
    const pic = `https://github.com/${data.login}.png`;

    const userInfo = `
°GITHUB USER INFO°

♦️ Name: ${data.name}
🔖 Username: ${data.login}
✨ Bio: ${data.bio}
🏢 Company: ${data.company}
📍 Location: ${data.location}
📧 Email: ${data.email}
📰 Blog: ${data.blog}
🔓 Public Repo: ${data.public_repos}
👪 Followers: ${data.followers}
🫶 Following: ${data.following}
    `;

    await client.sendMessage(m.chat, { image: { url: pic }, caption: userInfo }, { quoted: m });
  } catch (e) {
    m.reply("User not found, try again.");
  }
});

dreaded({
  pattern: "google",
  alias: ["web"],
  desc: "Google command",
  category: "Search",
  filename: __filename
}, async ({ client, m, text }) => {
  if (!text) return m.reply("Provide a search term!\nEg: .google what is treason");

  const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?q=${text}&key=AIzaSyDMbI3nvmQUrfjoCJYLS69Lej1hSXQjnWI&cx=baf9bdb0c631236e5`);
  if (!data.items.length) return m.reply("❌ Unable to find a result");

  let tex = `GOOGLE SEARCH\n🔍 Term: ${text}\n\n`;
  data.items.forEach(item => {
    tex += `🪧 Title: ${item.title}\n🖥 Description: ${item.snippet}\n🌐 Link: ${item.link}\n\n`;
  });
  m.reply(tex);
});

dreaded({
  pattern: "lyrics",
  desc: "Lyrics command",
alias: ["lyric"],
  category: "Search",
  filename: __filename
}, async ({ client, m, text, fetchJson }) => {
  if (!text) return m.reply("Provide a song name!");

  try {
    const apiUrl = `https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(text)}`;
    const data = await fetchJson(apiUrl);

    if (!data.success || !data.result || !data.result.lyrics) {
      return m.reply(`Lyrics for "${text}" not found.`);
    }

    const { title, artist, link, thumb, lyrics } = data.result;
    const imageUrl = thumb || "https://i.imgur.com/Cgte666.jpeg";
    const imageBuffer = await fetch(imageUrl).then(res => res.buffer()).catch(() => null);

    if (!imageBuffer) return m.reply("Image fetch failed.");

    const caption = `**Title**: ${title}\n**Artist**: ${artist}\n\n${lyrics}`;
    await client.sendMessage(m.chat, { image: imageBuffer, caption }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply(`An error occurred while fetching lyrics.`);
  }
});

dreaded({
  pattern: "movie",
  desc: "Movie command",
  category: "Search",
  filename: __filename
}, async ({ client, m, text }) => {
  if (!text) return m.reply("Provide a movie or TV show name.");

  try {
    const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
    let imdbt = `
⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍
\`\`\` IMDB MOVIE SEARCH \`\`\`
⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎
🎬Title: ${data.Title}
📅Year: ${data.Year}
⭐Rated: ${data.Rated}
📆Released: ${data.Released}
⏳Runtime: ${data.Runtime}
🌀Genre: ${data.Genre}
👨‍💻Director: ${data.Director}
✍Writer: ${data.Writer}
👨Actors: ${data.Actors}
📃Plot: ${data.Plot}
🌐Language: ${data.Language}
🌍Country: ${data.Country}
🎖️Awards: ${data.Awards}
📦BoxOffice: ${data.BoxOffice}
🏙️Production: ${data.Production}
🌟imdbRating: ${data.imdbRating}
❎imdbVotes: ${data.imdbVotes}`;

    await client.sendMessage(m.chat, { image: { url: data.Poster }, caption: imdbt }, { quoted: m });
  } catch (e) {
    m.reply("Cannot find that movie.");
  }
});

dreaded({
  pattern: "stickersearch",
  desc: "Stickersearch command",
  category: "Search",
  filename: __filename
}, async ({ client, m, text, botname }) => {
  if (!text) return m.reply("Provide a sticker keyword!");
  if (m.isGroup) m.reply("I'll send the stickers to your inbox 📥");

  const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";

  try {
    for (let i = 0; i < 8; i++) {
      const gif = await axios.get(`https://tenor.googleapis.com/v2/search?q=${text}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`);
      const gifUrl = gif.data.results[i]?.media_formats.gif.url;
      if (!gifUrl) continue;

      const sticker = new Sticker(gifUrl, {
        pack: botname,
        type: StickerTypes.FULL,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 60,
        background: "transparent"
      });

      await client.sendMessage(m.sender, { sticker: await sticker.toBuffer() }, { quoted: m });
    }
  } catch (e) {
    m.reply("Error fetching stickers.");
  }
});

dreaded({
  pattern: "wallpaper",
  desc: "Wallpaper command",
  category: "Search",
  filename: __filename
}, async ({ client, mime, m, text }) => {
  if (!text) return m.reply(`Example: _wallpaper Anime, 5_`);

  let [query, count] = text.includes(',') ? text.split(',').map(s => s.trim()) : [text.trim(), null];
  count = count ? parseInt(count) : null;

  try {
    const results = await fetchWallpapers(query);
    if (!results.length) return m.reply(`No results found for "${query}".`);

    const max = count ? Math.min(results.length, count) : results.length;
    await m.reply(`Fetching ${max} wallpaper(s)...`);

    for (let i = 0; i < max; i++) {
      await client.sendMessage(m.chat, {
        image: { url: results[i].image },
        fileName: `wallpaper_${i + 1}.jpg`
      }, { quoted: m });

      if (i < max - 1) await new Promise(res => setTimeout(res, 1000));
    }
  } catch (e) {
    console.error(e);
    m.reply("Failed to fetch wallpapers.");
  }
});

async function fetchWallpapers(query) {
  const searchUrl = `https://www.uhdpaper.com/search?q=${query}&by-date=true`;
  const { data } = await axios.get(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*"
    }
  });

  const $ = cheerio.load(data);
  let results = [];
  $('.post-outer').each((_, el) => {
    const image = $(el).find('img').attr('src');
    if (image) results.push({ image });
  });

  return results;
}

dreaded({
  pattern: "wiki",
  desc: "Wiki command",
alias: ["wikipedia"],
  category: "Search",
  filename: __filename
}, async ({ client, m, text }) => {
  try {
    if (!text) return m.reply("Provide the term to search, e.g., what is JavaScript?");
    const con = await wiki.summary(text);
    const texa = `📘 *${con.title}*

📝 *Description:* ${con.description}

📖 *Summary:*
${con.extract}

🔗 *More:* ${con.content_urls?.mobile?.page}`;

    m.reply(texa);
  } catch (err) {
    console.error(err);
    m.reply("Not found.");
  }
});
