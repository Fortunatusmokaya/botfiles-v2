const axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");

async function fetchTikTokInfo(videoUrl) {
  try {
    const payload = qs.stringify({ q: videoUrl });
    const headers = {
      Accept: "*/*",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://tiksave.io",
      Referer: "https://tiksave.io/en",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
    };

    const res = await axios.post("https://tiksave.io/api/ajaxSearch", payload, { headers });
    const json = res.data;

    if (!json || !json.data || typeof json.data !== "string") {
      return { success: false, error: "Invalid response structure from TikSave" };
    }

    const $ = cheerio.load(json.data);
    const title = $("h3").first().text().trim();

    let mp4 = null;
    let mp3 = null;

    $("a.tik-button-dl").each((_, el) => {
      const text = $(el).text().toLowerCase();
      const link = $(el).attr("href");

      if (text.includes("mp4 hd") && !mp4) {
        mp4 = link;
      } else if (text.includes("mp4") && !mp4) {
        mp4 = link;
      } else if (text.includes("mp3") && !mp3) {
        mp3 = link;
      }
    });

    return {
      success: true,
      title,
      mp4,
      mp3,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = fetchTikTokInfo;