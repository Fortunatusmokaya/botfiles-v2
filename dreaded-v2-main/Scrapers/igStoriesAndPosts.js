const axios = require("axios");
const cheerio = require("cheerio");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  Referer: "https://mollygram.com/",
  Origin: "https://mollygram.com",
};

async function fetchAllPosts(username) {
  try {
    const method = "allposts";
    const res = await axios.get(
      `https://media.mollygram.com/?url=${username}&method=${method}`,
      { headers }
    );

    const data = res.data;
    if (data.status !== "ok" || !data.html) return { total: 0, items: [] };

    const $ = cheerio.load(data.html);
    const posts = [];

    $(".load").each((_, el) => {
      const video = $(el).find("video source").attr("src");
      const image = $(el).find("img").attr("src");

      if (video) {
        posts.push({ type: "video", url: video });
      } else if (image) {
        posts.push({ type: "image", url: image });
      }
    });

    return { total: posts.length, items: posts };
  } catch {
    return { total: 0, items: [] };
  }
}

async function fetchStories(username) {
  try {
    const method = "allstories";
    const res = await axios.get(
      `https://media.mollygram.com/?url=${username}&method=${method}`,
      { headers }
    );

    const data = res.data;
    if (data.status !== "ok" || !data.html) return { total: 0, items: [] };

    const $ = cheerio.load(data.html);
    const stories = [];

    $(".load").each((_, el) => {
      const video = $(el).find("video source").attr("src");
      const image = $(el).find("img").attr("src");

      if (video) {
        stories.push({ type: "video", url: video });
      } else if (image) {
        stories.push({ type: "image", url: image });
      }
    });

    return { total: stories.length, items: stories };
  } catch {
    return { total: 0, items: [] };
  }
}

module.exports = {
  fetchAllPosts,
  fetchStories,
};