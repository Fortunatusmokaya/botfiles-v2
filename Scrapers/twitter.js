const axios = require('axios');
const cheerio = require('cheerio');

async function downloadFromSSSTwitter(twitterUrl) {
  const form = new URLSearchParams({
    id: twitterUrl,
    locale: 'en',
    tt: '19ac727f5db6138d2caccb09868e94a0',
    ts: '1752837717',
    source: 'form',
  });

  const postHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://ssstwitter.com',
    'Referer': 'https://ssstwitter.com/',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Hx-Request': 'true',
    'Hx-Target': 'target',
    'Hx-Current-Url': 'https://ssstwitter.com/',
  };

  
  await axios.post('https://ssstwitter.com/', form, {
    headers: postHeaders,
    maxRedirects: 0,
    validateStatus: null,
  });

  
  const res = await axios.get('https://ssstwitter.com/result_normal?en', {
    headers: postHeaders,
  });

  const $ = cheerio.load(res.data);
  const links = [];

  $('a.download-btn[data-directurl]').each((i, el) => {
    const url = $(el).attr('data-directurl');
    if (url && url.startsWith('https://ssscdn.io/')) {
      links.push(url);
    }
  });

  return {
    mp4high: links[0] || null,
    mp4mid: links[1] || null,
    mp4low: links[2] || null,
  };
}

module.exports = { downloadFromSSSTwitter };