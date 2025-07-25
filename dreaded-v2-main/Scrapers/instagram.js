const axios = require("axios");
const qs = require("qs");


async function fetchIgMp4(instagramUrl) {
  const formData = {
    sf_url: instagramUrl,
    sf_submit: "",
    new: 2,
    lang: "en",
    app: "",
    country: "ke",
    os: "Android",
    browser: "Chrome",
    channel: "downloader",
    "sf-nomad": 1,
    url: instagramUrl,
    ts: Date.now(),
    _ts: Date.now() - 600000,
    _tsc: 0,
    _s: "5cfe24caca9b21e6c29e50fad53bbac4"
  };

  try {
    const response = await axios.post(
      "https://snapins.ai/action.php",
      qs.stringify(formData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Origin": "https://snapins.ai",
          "Referer": "https://snapins.ai/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Mobile Safari/537.36"
        }
      }
    );

    const data = response.data;

    if (data.status === "success" && data.data?.length) {
      const downloadUrl = data.data[0]?.downloadUrl;
      return { igmp4: downloadUrl };
    } else {
      return { error: "Media not found or request failed." };
    }
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = fetchIgMp4;