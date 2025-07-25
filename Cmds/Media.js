const dreaded = global.dreaded;
const cheerio = require('cheerio');
const yts = require("yt-search");
const fetch = require("node-fetch");
const acrcloud = require("acrcloud");
const fs = require("fs");
const FormData = require('form-data');
const path = require('path');
const axios = require("axios");
const fetchTikTokInfo = require("../Scrapers/tiktok");
const ytdownload = require("../Scrapers/ytdownload");
const { tmpdir } = require("os");
const downloadVideo = require('../Scrapers/ytdownload2');
const { downloadFromSSSTwitter } = require('../Scrapers/twitter');
const { Readable } = require("stream");
const { fetchAllPosts, fetchStories } = require("../Scrapers/igStoriesAndPosts");
const fetchIgMp4 = require("../Scrapers/instagram");
const { igStalk } = require("../Scrapers/igstalk");

const mm = require('music-metadata');
const ffmpeg = require('fluent-ffmpeg');



function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}


async function isValidMp3Buffer(buffer) {
  try {
    const metadata = await mm.parseBuffer(buffer, 'audio/mpeg');
    return metadata.format.container === 'MPEG' && metadata.format.duration > 0;
  } catch {
    return false;
  }
}


async function waitForFileToStabilize(filePath, timeout = 5000) {
  let lastSize = -1;
  let stableCount = 0;
  const interval = 200;

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(async () => {
      try {
        const { size } = await fs.promises.stat(filePath);
        if (size === lastSize) {
          stableCount++;
          if (stableCount >= 3) {
            clearInterval(timer);
            return resolve();
          }
        } else {
          stableCount = 0;
          lastSize = size;
        }

        if (Date.now() - start > timeout) {
          clearInterval(timer);
          return reject(new Error("File stabilization timed out."));
        }
      } catch (err) {
        
      }
    }, interval);
  });
}


async function reencodeMp3(buffer) {
  const inputPath = '/tmp/input.mp3';
  const outputPath = '/tmp/output.mp3';

  fs.writeFileSync(inputPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .audioFrequency(44100)
      .on('end', async () => {
        try {
          await waitForFileToStabilize(outputPath);
          const fixedBuffer = fs.readFileSync(outputPath);
          resolve(fixedBuffer);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject)
      .save(outputPath);
  });
}


dreaded({
  pattern: "igstalk",
  desc: "Instagram profile stalk",
  category: "Search",
  filename: __filename
}, async (context) => {
  const { m, args, client } = context;
  const username = args[0];

  if (!username) {
    return client.sendMessage(m.chat, { text: "Please provide a username.\nExample: .igstalk drake" }, { quoted: m });
  }

  const result = await igStalk(username);

  if (result.error) {
    return client.sendMessage(m.chat, { text: "Failed to fetch profile." }, { quoted: m });
  }

  const caption = `
👤 *${result.name}* (@${result.username})
✅ Verified: ${result.verified ? "Yes" : "No"}

📝 Bio: ${result.bio}
📷 Posts: ${result.posts}
👥 Followers: ${result.followers}
🔄 Following: ${result.following}
📊 Engagement Rate: ${result.engagement_rate}%
`.trim();

  if (!result.profile_pic) {
 
    return client.sendMessage(m.chat, { text: caption }, { quoted: m });
  }

  
  return client.sendMessage(m.chat, {
    image: { url: result.profile_pic },
    caption
  }, { quoted: m });
});

dreaded({
  pattern: "igposts",
  desc: "Fetch Instagram posts",
alias: ["igpost"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) return m.reply("🔍 Provide an Instagram username.");

  const result = await fetchAllPosts(text.trim());

  if (result.total === 0) {
    return m.reply("No posts found. The account might be private or has no content.");
  }

  if (result.total > 4) {
    await m.reply(`📸 Found ${result.total} posts. Sending 4 to avoid spam.`);
  } else {
    await m.reply(`📸 Found ${result.total} posts.`);
  }

  const postsToSend = result.items.slice(0, 4);

  for (const item of postsToSend) {
    if (item.type === "video") {
      await client.sendMessage(m.chat, { video: { url: item.url } }, { quoted: m });
    } else {
      await client.sendMessage(m.chat, { image: { url: item.url } }, { quoted: m });
    }
  }
});

dreaded({
  pattern: "igstory",
  desc: "Fetch Instagram stories",
alias: ["igstories", "stories"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) return m.reply("🔍 Provide an Instagram username.");

  const result = await fetchStories(text.trim());

  if (result.total === 0) {
    return m.reply("No stories found. The account might be private or has no content.");
  }

  if (result.total > 4) {
    await m.reply(`📖 Found ${result.total} stories. Sending 4 to avoid spam.`);
  } else {
    await m.reply(`📖 Found ${result.total} stories.`);
  }

  const storiesToSend = result.items.slice(0, 4);

  for (const item of storiesToSend) {
    if (item.type === "video") {
      await client.sendMessage(m.chat, { video: { url: item.url } }, { quoted: m });
    } else {
      await client.sendMessage(m.chat, { image: { url: item.url } }, { quoted: m });
    }
  }
});

dreaded({
  pattern: "play",
  desc: "Play command",
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) return m.reply("❌ Please provide a song name!");

  try {
    const { videos } = await yts(text);
    if (!videos || videos.length === 0) {
      throw new Error("No songs found!");
    }

    const song = videos[0];
    let mp3 = null;

    try {
      const result = await ytdownload(song.url);
      mp3 = result?.mp3;
    } catch (e) {}

    if (mp3) {
      const responses = await axios.get(mp3, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const mp3Buffer = Buffer.from(responses.data);

      
      const sizeMB = mp3Buffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        await m.reply("File is large, download might take a while...");
      }

      let finalBuffer = mp3Buffer;
      const isValid = await isValidMp3Buffer(mp3Buffer);
      if (!isValid) {
        await m.reply("Re-encoding your song...");
        finalBuffer = await reencodeMp3(mp3Buffer);
      }

      await m.reply(`🎵 Downloading: *${song.title}*`);
      await client.sendMessage(m.chat, {
        document: finalBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${song.title}.mp3`
      }, { quoted: m });

    } else {
      const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${song.url}&format=mp3`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'audio/mpeg'
        }
      });

      if (!response.ok) {
        throw new Error(`Backup download failed with status ${response.status}`);
      }

      await m.reply("_Retrying downloading from backup..._");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        await m.reply("⚠️ File is large, download might take a while...");
      }

      await client.sendMessage(m.chat, {
        audio: buffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${song.title}.mp3`
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    return m.reply("❌ Download failed: " + error.message);
  }
});

dreaded({
  pattern: "igdl",
  desc: "Instagram video downloader",
  alias: ["ig", "instagram"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname } = context;

  if (!text) return m.reply("📝 Provide an Instagram Reel or Post URL!");
  if (!/instagram\.com\/(reel|p|tv)\//i.test(text)) return m.reply(" Invalid Instagram link!");

  try {
    const result = await fetchIgMp4(text);
    if (result.error || !result.igmp4) return m.reply(" Failed to extract video.");

    await client.sendMessage(
      m.chat,
      {
        video: { url: result.igmp4 },
        caption: `Downloaded via ${botname}`
      },
      { quoted: m }
    );

  } catch (err) {
    console.error("IGDL Error:", err);
    m.reply(` Error: ${err.message}`);
  }
});


dreaded({
  pattern: "twtdl",
  desc: "Download Twitter/X video",
  alias: ["twitter"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname } = context;

  if (!text) return m.reply("📝 Provide a Twitter/X video link!");
  if (!/x\.com|twitter\.com/.test(text)) return m.reply("❌ Invalid Twitter link!");

  try {
    
    const result = await downloadFromSSSTwitter(text);
    const videoUrl = result.mp4high || result.mp4mid || result.mp4low;
    if (!videoUrl) return m.reply("❌ No video found in this tweet");

  
    const response = await axios.get(videoUrl, {
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

   
    await client.sendMessage(
      m.chat,
      { 
        video: Buffer.from(response.data),
        mimetype: 'video/mp4',
        caption: `Downloaded via ${botname}`
      },
      { quoted: m }
    );

  } catch (err) {
    console.error("TWTDL Error:", err);
    m.reply(`⚠️ Failed: ${err.message}`);
  }
});

dreaded({
  pattern: "yts",
  desc: "Search YouTube videos",
  alias: ["ytsearch", "ytfind"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) return m.reply("🔍 Please enter a search query, e.g. yts careless whisper");

  try {
    const results = await yts(text);
    const videos = results?.videos?.slice(0, 5);

    if (!videos || videos.length === 0) {
      return m.reply("❌ No results found.");
    }

    const first = videos[0];

    let caption = `🎬 Top YouTube Results:\n\n`;
    videos.forEach((v, i) => {
      caption += `*${i + 1}. ${v.title}*\n`;
      caption += `⏱️ Duration: ${v.timestamp}\n`;
      caption += `🔗 URL: ${v.url}\n\n`;
    });

    await client.sendMessage(m.chat, {
      image: { url: first.thumbnail },
      caption,
    }, { quoted: m });

  } catch (error) {
    m.reply("❌ Failed to fetch search results.\n" + error.message);
  }
});





dreaded({
  pattern: "video",
  desc: "Download YouTube video..",
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) {
    return m.reply("Please provide a video name!");
  }

  try {
    const { videos } = await yts(text);
    if (!videos || videos.length === 0) {
      return m.reply("❌ No videos found.");
    }

    const video = videos[0];
    const url = video.url;

    await m.reply("⏳ Getting download link...");

    let mp4 = null;
    try {
      const result = await ytdownload(url);
      mp4 = result?.mp4;
    } catch (e) {}

    if (mp4) {
      await client.sendMessage(m.chat, {
        video: { url: mp4 },
        mimetype: "video/mp4",
        fileName: `${video.title}.mp4`
      }, { quoted: m });
    } else {
      await m.reply("⚠️ Fast method failed. Downloading video, please wait...");
      const filePath = await downloadVideo(url, '360p');

      await client.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        mimetype: "video/mp4",
        fileName: `${video.title}.mp4`
      }, { quoted: m });

      fs.unlinkSync(filePath);
    }

  } catch (err) {
    return m.reply("❌ Download failed: " + err);
  }
});


dreaded({
  pattern: "tikdl",
  desc: "Download TikTok video and audio",
  alias: ["tiktok"],
  category: "Media",
  filename: __filename,
}, async ({ client, m, args }) => {
  const url = args[0];

  if (!url || !url.includes("tiktok.com")) {
    return m.reply("❌ Please provide a valid TikTok video URL.");
  }

  const result = await fetchTikTokInfo(url);
  const { mp4, title } = result;

  if (!mp4) {
    return m.reply("❌ Failed to fetch media. Try again later.");
  }

  m.reply("⬇️ Downloading...");

  try {
    await client.sendMessage(m.chat, {
      video: { url: mp4 },
      mimetype: "video/mp4",
      caption: `📤 ${title || "TikTok video downloaded"}`,
    }, { quoted: m });
  } catch (err) {
    m.reply("❌ Failed to send the video.");
  }
});

dreaded({
  pattern: "alldl",
  desc: "Alldl command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, botname, fetchJson } = context;
  
  if (!text) return m.reply("Provide any link for download.\nE.g:- FB, X, tiktok, capcut etc");
  
  
  
  try {
  
  const data = await fetchJson(`https://api.dreaded.site/api/alldl?url=${text}`);
  
  
          if (!data || data.status !== 200 || !data.data || !data.data.videoUrl) {
              return m.reply("We are sorry but the API endpoint didn't respond correctly. Try again later.");
          }
  
  
  
  const allvid = data.data.videoUrl;
  
  await client.sendMessage(m.chat,{video : {url : allvid },caption : `Downloaded by ${botname}`,gifPlayback : false },{quoted : m}) 
  
  } catch (e) {
  
  m.reply("An error occured. API might be down\n" + e)
  
  }
});


dreaded({
  pattern: "apk",
  desc: "Apk command",
alias: ["app"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, fetchJson } = context;
  
  
  try {
  if (!text) return m.reply("Provide an app name");
  
  let data = await fetchJson (`https://bk9.fun/search/apk?q=${text}`);
          let dreaded = await fetchJson (`https://bk9.fun/download/apk?id=${data.BK9[0].id}`);
           await client.sendMessage(
                m.chat,
                {
                  document: { url: dreaded.BK9.dllink },
                  fileName: dreaded.BK9.name,
                  mimetype: "application/vnd.android.package-archive"}, { quoted: m });
  
  } catch (error) {
  
  m.reply("Apk download failed\n" + error)
  
  }
});


dreaded({
  pattern: "fbdl",
  desc: "Fbdl command",
alias: ["fb", "facebook"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, botname, fetchJson } = context;
  
      if (!text) {
          return m.reply("Provide a facebook link for the video");
      }
  
      if (!text.includes("facebook.com")) {
          return m.reply("That is not a facebook link.");
      }
  
      try {
                  let data = await fetchJson(`https://api.dreaded.site/api/facebook?url=${text}`);
  
  
          if (!data || data.status !== 200 || !data.facebook || !data.facebook.sdVideo) {
              return m.reply("We are sorry but the API endpoint didn't respond correctly. Try again later.");
          }
  
  
  
  
          const fbvid = data.facebook.sdVideo;
          const title = data.facebook.title;
  
  
          if (!fbvid) {
              return m.reply("Invalid facebook data. Please ensure the video exists.");
          }
  
          await client.sendMessage(
              m.chat,
              {
                  video: { url: fbvid },
                  caption: `${title}\n\nDownloaded by ${botname}`,
                  gifPlayback: false,
              },
              { quoted: m }
          );
      } catch (e) {
          console.error("Error occurred:", e);
          m.reply("An error occurred. API might be down. Error: " + e.message);
      }
});


dreaded({
  pattern: "gitclone",
  desc: "Gitclone command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text } = context;
  
  if (!text) return m.reply(`Where is the link?`)
  if (!text.includes('github.com')) return m.reply(`Is that a GitHub repo link ?!`)
  let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
      let [, user3, repo] = text.match(regex1) || []
      repo = repo.replace(/.git$/, '')
      let url = `https://api.github.com/repos/${user3}/${repo}/zipball`
      let filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
      await client.sendMessage(m.chat, { document: { url: url }, fileName: filename+'.zip', mimetype: 'application/zip' }, { quoted: m }).catch((err) => m.reply("error"))
});


dreaded({
  pattern: "mediafire",
  desc: "Mediafire command",
alias: ["mf"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  const { client, m, text, botname  } = context;
  
  
  
  
  async function MediaFire(url, options) {
    try {
      let mime;
      options = options ? options : {};
      const res = await axios.get(url, options);
      const $ = cheerio.load(res.data);
      const hasil = [];
      const link = $('a#downloadButton').attr('href');
      const size = $('a#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace('                         ', '');
      const seplit = link.split('/');
      const nama = seplit[5];
      mime = nama.split('.');
      mime = mime[1];
      hasil.push({ nama, mime, size, link });
      return hasil;
    } catch (err) {
      return err;
    }
  }
  
  if (!text) return m.reply("provide mediafire link for download");
  
  if (!text.includes('mediafire.com')) {
          return m.reply(`Doesnt look like a mediafire link, uh?`);
      }
  
  
  await m.reply(`A moment...`);
  
  try {
  
          const fileInfo = await MediaFire(text);
  
  
  
  if (!fileInfo || !fileInfo.length) {
      return m.reply("Sorry, this file is no longer stored in mediafire.");
  }
  
  
  
  
  
  
          await client.sendMessage(
              m.chat,
              {
                  document: {
                      url: fileInfo[0].link,
                  },
                  fileName: fileInfo[0].nama,
                  mimetype: fileInfo[0].mime,
                  caption: `${fileInfo[0].nama} downloaded by ${botname}`, 
              },
              { quoted: m }
  
  
     );
  
  } catch (error) {
  
  
          m.reply(`An error occured:\n` + error);
      }
});








dreaded({
  pattern: "shazam",
  desc: "Shazam command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
  
  
  
  
      const { client, m, text, qmsg, mime } = context;
  
  try {
  
  let acr = new acrcloud({
      host: 'identify-ap-southeast-1.acrcloud.com',
      access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
      access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
    });
  
  if (!/video|audio/.test(mime)) return m.reply("Tag a short video or audio for the bot to analyse.");
  
  let p = m.quoted ? m.quoted : m
  
                  let buffer = await p.download()
                 
  
  let { status, metadata } = await acr.identify(buffer)
                  if (status.code !== 0) return m.reply(status.msg); 
                  let { title, artists, album, genres, release_date } = metadata.music[0]
                  let txt = `Title: ${title}${artists ? `\nArtists: ${artists.map(v => v.name).join(', ')}` : ''}`
                  txt += `${album ? `\nAlbum: ${album.name}` : ''}${genres ? `\nGenres: ${genres.map(v => v.name).join(', ')}` : ''}\n`
                  txt += `Release Date: ${release_date}`
                   m.reply(txt.trim())
  
  } catch (error) {
  
  await m.reply("Song not recognisable..")
  
  }
});


dreaded({
  pattern: "song",
  desc: "song command",
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  if (!text) return m.reply("❌ Please provide a song name!");

  try {
    const { videos } = await yts(text);
    if (!videos || videos.length === 0) {
      throw new Error("No songs found!");
    }

    const song = videos[0];
    let mp3 = null;

    try {
      const result = await ytdownload(song.url);
      mp3 = result?.mp3;
    } catch (e) {}

    if (mp3) {
      const responses = await axios.get(mp3, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const mp3Buffer = Buffer.from(responses.data);

      
      const sizeMB = mp3Buffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        await m.reply("File is large, download might take a while...");
      }

      let finalBuffer = mp3Buffer;
      const isValid = await isValidMp3Buffer(mp3Buffer);
      if (!isValid) {
        await m.reply("Re-encoding your song...");
        finalBuffer = await reencodeMp3(mp3Buffer);
      }

      await m.reply(`🎵 Downloading: *${song.title}*`);
      await client.sendMessage(m.chat, {
        audio: finalBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${song.title}.mp3`
      }, { quoted: m });

    } else {
      const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${song.url}&format=mp3`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'audio/mpeg'
        }
      });

      if (!response.ok) {
        throw new Error(`Backup download failed with status ${response.status}`);
      }

      await m.reply("_Retrying downloading from backup..._");

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const sizeMB = buffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        await m.reply("⚠️ File is large, download might take a while...");
      }

      await client.sendMessage(m.chat, {
        audio: buffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${song.title}.mp3`
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    return m.reply("❌ Download failed: " + error.message);
  }
});


dreaded({
  pattern: "spotify",
  desc: "Spotify command",
  category: "Media",
  filename: __filename
}, async (context) => {
  
      const { client, m, text, fetchJson } = context;
  
          if (!text) return m.reply("What song do you want to download?");
  
  
  try {
  
  
          let data = await fetchJson(`https://api.dreaded.site/api/spotifydl?title=${text}`);
  
  if (data.success) {
  
  await m.reply("Sending song in audio and document formats...");
  
  const audio = data.result.downloadLink;
  
  const filename = data.result.title
  
          await client.sendMessage(
              m.chat,
              {
                  document: { url: audio },
                  mimetype: "audio/mpeg",
                  fileName: `${filename}.mp3`,
              },
              { quoted: m }
          );
  
  await client.sendMessage(
              m.chat,
              {
                  audio: { url: audio },
                  mimetype: "audio/mpeg",
                  fileName: `${filename}.mp3`,
              },
              { quoted: m }
          );
  
  
  } else {
  
  await m.reply("Failed to get a valid response from API endpoint");
  
  }
  
  } catch (error) {
  
  m.reply("Unable to fetch download link, try matching exact song name or with artist name.")
  
  }
});


dreaded({
  pattern: "tikmp3",
  desc: "Download TikTok audio only",
  alias: ["tiktokaudio", "ttmp3"],
  category: "Media",
  filename: __filename,
}, async ({ client, m, args }) => {
  const url = args[0];

  if (!url || !url.includes("tiktok.com")) {
    return m.reply("❌ Please provide a valid TikTok video URL.");
  }

  const result = await fetchTikTokInfo(url);
  const { mp3, title } = result;

  if (!mp3) {
    return m.reply("❌ Failed to fetch audio. Try again later.");
  }

  m.reply("🎵 Sending audio...");

  try {
    await client.sendMessage(m.chat, {
      audio: { url: mp3 },
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${title || "tiktok_audio"}.mp3`,
    }, { quoted: m });
  } catch (err) {
    m.reply("❌ Failed to send the audio.");
  }
});








dreaded({
  pattern: "upload",
  desc: "Upload command",
alias: ["url", "tourl"],
  category: "Media",
  filename: __filename
}, async (context) => {
  
    const { client, m } = context;
    
    
    
    
  
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
  
    if (!mime) return m.reply('❌ Reply to a media file to upload.');
  
    const mediaBuffer = await q.download();
    if (mediaBuffer.length > 100 * 1024 * 1024) return m.reply('❌ File too large (limit 100 MB).');
  
    const tempFile = path.join(__dirname, `upload_${Date.now()}`);
    fs.writeFileSync(tempFile, mediaBuffer);
  
    m.reply('⏳ Starting upload...');
  
    const providers = [
      {
        name: 'Catbox.moe',
        upload: async () => {
          const form = new FormData();
          form.append('reqtype', 'fileupload');
          form.append('fileToUpload', fs.createReadStream(tempFile));
          const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
          });
          if (!res.data.startsWith('https://')) throw new Error('Invalid Catbox response');
          return { page: res.data, direct: res.data };
        }
      },
      {
        name: 'Pixeldrain',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://pixeldrain.com/api/file/anonymous', form, {
            headers: form.getHeaders()
          });
          const id = res.data.id;
          return {
            page: `https://pixeldrain.com/u/${id}`,
            direct: `https://pixeldrain.com/api/file/${id}`
          };
        }
      },
      {
        name: 'File.io',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://file.io/', form, {
            headers: form.getHeaders()
          });
          if (!res.data.success) throw new Error('Upload failed');
          return { page: res.data.link, direct: res.data.link };
        }
      },
      {
        name: 'Transfer.sh',
        upload: async () => {
          const fileName = `upload_${Date.now()}.bin`;
          const res = await axios.put(`https://transfer.sh/${fileName}`, fs.createReadStream(tempFile), {
            headers: { 'Content-Type': 'application/octet-stream' }
          });
          return { page: res.data, direct: res.data };
        }
      },
      {
        name: 'Uguu.se',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
          });
          if (!res.data.files || res.data.files.length === 0) throw new Error('No file returned');
          return {
            page: res.data.files[0].url,
            direct: res.data.files[0].url
          };
        }
      },
      {
        name: 'Bayfiles',
        upload: async () => {
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFile));
          const res = await axios.post('https://api.bayfiles.com/upload', form, {
            headers: form.getHeaders()
          });
          const fileData = res.data.data.file;
          return {
            page: fileData.url.short,
            direct: fileData.url.full
          };
        }
      }
    ];
  
    for (let i = 0; i < providers.length; i++) {
      const { name, upload } = providers[i];
      try {
        await m.reply(`📡 Trying ${name}...`);
        const result = await upload();
        fs.unlinkSync(tempFile);
        return m.reply(`✅ Uploaded to ${name}!\n\n🌐 Page: ${result.page}\n📥 Direct: ${result.direct}`);
      } catch (err) {
        const next = providers[i + 1] ? providers[i + 1].name : 'no other providers';
        await m.reply(`⚠️ ${name} failed: ${err.message}\n🔁 Trying ${next}...`);
      }
    }
  
    fs.unlinkSync(tempFile);
    m.reply('❌ All upload providers failed. Please try again later.');
});







dreaded({
  pattern: "ytmp3",
  desc: "Ytmp3 command",
  alias: ["yta"],
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  try {
    let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
    if (!urls) return m.reply('Provide a valid YouTube link, eh?');

    const url = urls[0];
    const search = await yts(url);
    const title = search.all[0]?.title || 'yt_audio';
    let audioUrl;

    try {
      const result = await ytdownload(url);
      audioUrl = result?.mp3;
    } catch (_) {}

    if (audioUrl) {
      await m.reply(`_Downloading ${title}_`);
      await client.sendMessage(m.chat, {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });

      await client.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });

    } else {
      const response = await fetch(`http://music.dreaded.site:3000/api/yt?url=${url}&format=mp3`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'audio/mpeg'
        }
      });

      if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

      await m.reply(`_Downloading ${title}_`);
      await client.sendMessage(m.chat, {
        audio: { url: response.url },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });

      await client.sendMessage(m.chat, {
        document: { url: response.url },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });
    }

  } catch (error) {
    m.reply("Download failed\n" + error.message);
  }
});


dreaded({
  pattern: "ytmp4",
  desc: "Download YouTube video from link.",
  category: "Media",
alias: ["ytv"],
  filename: __filename
}, async (context) => {
  const { client, m, text } = context;

  let urls = text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
  if (!urls) return m.reply('Provide a valid YouTube link, eh?');

  const url = urls[0];

  try {
    await m.reply("⏳ Getting download link...");

    let mp4 = null;
    try {
      const result = await ytdownload(url);
      mp4 = result?.mp4;
    } catch (e) {}

    if (mp4) {
      await client.sendMessage(m.chat, {
        video: { url: mp4 },
        mimetype: "video/mp4",
        fileName: "video.mp4"
      }, { quoted: m });
    } else {
      await m.reply("Fast method failed. Downloading video, please wait...");
      const filePath = await downloadVideo(url, '360p');

      await client.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        mimetype: "video/mp4",
        fileName: "video.mp4"
      }, { quoted: m });

      fs.unlinkSync(filePath);
    }

  } catch (err) {
    return m.reply("❌ Download failed: " + err.message);
  }
});

