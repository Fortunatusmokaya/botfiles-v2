const axios = require('axios');
const fs = require('fs');
const path = require('path');


async function downloadVideo(url, quality) {
  try {
    const infoRes = await axios.post('https://api.ytmp4.fit/api/video-info', { url }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ytmp4.fit',
        'Referer': 'https://ytmp4.fit/',
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      }
    });

    const info = infoRes.data;
    const safeTitle = info.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(__dirname, `${safeTitle}_${quality}.mp4`);

    const downloadRes = await axios.post(
      'https://api.ytmp4.fit/api/download',
      { url, quality },
      {
        responseType: 'stream',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://ytmp4.fit',
          'Referer': 'https://ytmp4.fit/',
          'User-Agent': 'Mozilla/5.0',
          Accept: '*/*',
        },
      }
    );

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      downloadRes.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return filePath;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

module.exports = downloadVideo;