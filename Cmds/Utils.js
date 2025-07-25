const dreaded = global.dreaded;
const fetch = require('node-fetch');
const cheerio = require('cheerio');



dreaded({
  pattern: "bundesliga",
  desc: "Bundesliga command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text, fetchJson } = context;
  
      try {
  
          const data = await fetchJson('https://api.dreaded.site/api/standings/BL1');
  
          const standings = data.data;
  
          const message = `BUNDESLIGA TABLE STANDINGS\n\n${standings}`;
  
          await m.reply(message);
  
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch EPL standings.');
      }
});


dreaded({
  pattern: "catfact",
  desc: "Catfact command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, fetchJson } = context;
  
  
  try {
  
  
  const data = await fetchJson('https://api.dreaded.site/api/catfact');
  
  const fact = data.fact;
  
  await m.reply(fact);
  
  } catch (error) {
  
  m.reply('Something is wrong.')
  
  }
});


dreaded({
  pattern: "epl",
  desc: "Epl command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text, fetchJson } = context;
  
      try {
  
          const data = await fetchJson('https://api.dreaded.site/api/standings/PL');
  
          const standings = data.data;
  
          const message = `...EPL TABLE STANDINGS\n\n${standings}`;
  
          await m.reply(message);
  
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch EPL standings.');
      }
});


dreaded({
  pattern: "fact",
  desc: "Fact command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, fetchJson } = context;
  
  
  try {
  
  
  const data = await fetchJson('https://api.dreaded.site/api/fact');
  
  const fact = data.fact;
  
  await m.reply(fact);
  
  } catch (error) {
  
  m.reply('Something is wrong.')
  
  }
});



dreaded({
  pattern: "inspectweb",
  desc: "Inspectweb command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
  
  
      const { m, text } = context;
  
      if (!text) return m.reply("Provide a valid web link to fetch! The bot will crawl the website and fetch its HTML, CSS, JavaScript, and any media embedded in it.");
  
      if (!/^https?:\/\//i.test(text)) {
          return m.reply("Please provide a URL starting with http:// or https://");
      }
  
      try {
          const response = await fetch(text);
          const html = await response.text();
          const $ = cheerio.load(html);
  
          const mediaFiles = [];
          $('img[src], video[src], audio[src]').each((i, element) => {
              let src = $(element).attr('src');
              if (src) {
                  mediaFiles.push(src);
              }
          });
  
          const cssFiles = [];
          $('link[rel="stylesheet"]').each((i, element) => {
              let href = $(element).attr('href');
              if (href) {
                  cssFiles.push(href);
              }
          });
  
          const jsFiles = [];
          $('script[src]').each((i, element) => {
              let src = $(element).attr('src');
              if (src) {
                  jsFiles.push(src);
              }
          });
  
          await m.reply(`**Full HTML Content**:\n\n${html}`);
  
          if (cssFiles.length > 0) {
              for (const cssFile of cssFiles) {
                  const cssResponse = await fetch(new URL(cssFile, text));
                  const cssContent = await cssResponse.text();
                  await m.reply(`**CSS File Content**:\n\n${cssContent}`);
              }
          } else {
              await m.reply("No external CSS files found.");
          }
  
          if (jsFiles.length > 0) {
              for (const jsFile of jsFiles) {
                  const jsResponse = await fetch(new URL(jsFile, text));
                  const jsContent = await jsResponse.text();
                  await m.reply(`**JavaScript File Content**:\n\n${jsContent}`);
              }
          } else {
              await m.reply("No external JavaScript files found.");
          }
  
          if (mediaFiles.length > 0) {
              await m.reply(`**Media Files Found**:\n${mediaFiles.join('\n')}`);
          } else {
              await m.reply("No media files (images, videos, audios) found.");
          }
  
      } catch (error) {
          console.error(error);
          return m.reply("An error occurred while fetching the website content.");
      }
});


dreaded({
  pattern: "laliga",
  desc: "Laliga command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text, fetchJson } = context;
  
      try {
  
          const data = await fetchJson('https://api.dreaded.site/api/standings/PD');
  
          const standings = data.data;
  
          const message = `LALIGA TABLE STANDINGS\n\n${standings}`;
  
          await m.reply(message);
  
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch EPL standings.');
      }
});


dreaded({
  pattern: "ligue1",
  desc: "Ligue1 command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text, fetchJson } = context;
  
      try {
  
          const data = await fetchJson('https://api.dreaded.site/api/standings/FL1');
  
          const standings = data.data;
  
          const message = `LIGUE-1 TABLE STANDINGS\n\n${standings}`;
  
          await m.reply(message);
  
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch EPL standings.');
      }
});


dreaded({
  pattern: "matches",
  desc: "Matches command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
      try {
          let pl, laliga, bundesliga, serieA, ligue1;
  
          const plData = await fetchJson('https://api.dreaded.site/api/matches/PL');
          pl = plData.data;
  
          const laligaData = await fetchJson('https://api.dreaded.site/api/matches/PD');
          laliga = laligaData.data;
  
          const bundesligaData = await fetchJson('https://api.dreaded.site/api/matches/BL1');
          bundesliga = bundesligaData.data;
  
          const serieAData = await fetchJson('https://api.dreaded.site/api/matches/SA');
          serieA = serieAData.data;
  
          const ligue1Data = await fetchJson('https://api.dreaded.site/api/matches/FR');
          ligue1 = ligue1Data.data;
  
          let message = `Today Football Matches ⚽\n\n`;
  
          message += typeof pl === 'string' ? `🇬🇧 Premier League:\n${pl}\n\n` : pl.length > 0 ? `🇬🇧 Premier League:\n${pl.map(match => {
              const { game, date, time } = match;
              return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
          }).join('\n')}\n\n` : "🇬🇧 Premier League: No matches scheduled\n\n";
  
          if (typeof laliga === 'string') {
              message += `🇪🇸 La Liga:\n${laliga}\n\n`;
          } else {
              message += laliga.length > 0 ? `🇪🇸 La Liga:\n${laliga.map(match => {
                  const { game, date, time } = match;
                  return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
              }).join('\n')}\n\n` : "🇪🇸 La Liga: No matches scheduled\n\n";
          }
  
          message += typeof bundesliga === 'string' ? `🇩🇪 Bundesliga:\n${bundesliga}\n\n` : bundesliga.length > 0 ? `🇩🇪 Bundesliga:\n${bundesliga.map(match => {
              const { game, date, time } = match;
              return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
          }).join('\n')}\n\n` : "🇩🇪 Bundesliga: No matches scheduled\n\n";
  
          message += typeof serieA === 'string' ? `🇮🇹 Serie A:\n${serieA}\n\n` : serieA.length > 0 ? `🇮🇹 Serie A:\n${serieA.map(match => {
              const { game, date, time } = match;
              return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
          }).join('\n')}\n\n` : "🇮🇹 Serie A: No matches scheduled\n\n";
  
          message += typeof ligue1 === 'string' ? `🇫🇷 Ligue 1:\n${ligue1}\n\n` : ligue1.length > 0 ? `🇫🇷 Ligue 1:\n${ligue1.map(match => {
              const { game, date, time } = match;
              return `${game}\nDate: ${date}\nTime: ${time} (EAT)\n`;
          }).join('\n')}\n\n` : "🇫🇷 Ligue 1: No matches scheduled\n\n";
  
          message += "Times and dates are in East African Timezone (EAT).";
  
          await m.reply(message);
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch matches.' + error);
      }
});


dreaded({
  pattern: "screenshot",
  desc: "Screenshot command",
alias: ["ss", "ssweb"],
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
  
  
  const { client, m, text, botname } = context;
  
  
  
  try {
  let cap = `Screenshot by ${botname}`
  
  if (!text) return m.reply("Provide a website link to screenshot.")
  
  const image = `https://image.thum.io/get/fullpage/${text}`
  
  await client.sendMessage(m.chat, { image: { url: image }, caption: cap}, {quoted: m });
  
  
  } catch (error) {
  
  m.reply("An error occured.")
  
  }
});


dreaded({
  pattern: "serie-a",
  desc: "Serie-a command",
  category: "Utils",
  filename: __filename
}, async (context) => {
  
  
      const { client, m, text, fetchJson } = context;
  
      try {
  
          const data = await fetchJson('https://api.dreaded.site/api/standings/SA');
  
          const standings = data.data;
  
          const message = `SERIE-A TABLE STANDINGS\n\n${standings}`;
  
          await m.reply(message);
  
      } catch (error) {
          m.reply('Something went wrong. Unable to fetch EPL standings.');
      }
});


dreaded({
  pattern: "tinyurl",
  desc: "Tinyurl command",
alias: ["shorturl"],
  category: "Utils",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
      if (!text) {
          return m.reply("Please provide a URL to shorten.");
      }
  
      const urlRegex = /^(http:\/\/|https:\/\/)[^\s/$.?#].[^\s]*$/i;
      if (!urlRegex.test(text)) {
          return m.reply("That doesn't appear to be a valid URL.");
      }
  
      try {
          let data = await fetchJson(`https://api.dreaded.site/api/shorten-url?url=${encodeURIComponent(text)}`);
  
          if (!data || data.status !== 200 || !data.result || !data.result.shortened_url) {
              return m.reply("We are sorry, but the URL shortening service didn't respond correctly. Please try again later.");
          }
  
          const shortenedUrl = data.result.shortened_url;
          const originalUrl = data.result.original_url;
  
          await client.sendMessage(
              m.chat,
              {
                  text: `*Original URL*: ${originalUrl}\n\n*Shortened URL*: ${shortenedUrl}`,
              },
              { quoted: m }
          );
      } catch (e) {
          console.error("Error occurred:", e);
          m.reply("An error occurred while shortening the URL. Please try again later.");
      }
});
