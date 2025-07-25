const dreaded = global.dreaded;
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const FormData = require("form-data");
const fs = require("fs");
const { listEffects, applyDreadedEffect, isValid } = require("dreaded-effects");


dreaded({
  pattern: "filter",
  desc: "Apply PhotoFunia filters to an image",
  category: "Media",
  filename: __filename
}, async (context) => {
  const { client, m, args } = context;

  if (args.length === 0) {
    return m.reply("📸 To apply a filter, reply to an image and type:\n\n`filter <effect_name>`\n\nTo view all effects, type: `filter list`");
  }

  const arg = args[0].toLowerCase();

  if (arg === "list") {
    const effects = listEffects().join(", ");
    return m.reply(`✨ Available Effects:\n\n${effects}`);
  }

  const effect = arg;

  if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
  return m.reply("🖼️ reply to an image to apply the filter.");
}
  if (!isValid(effect)) {
    return m.reply("❌ Invalid effect name.\n\nUse `filter list` to see all valid effects.");
  }

  const imageBuffer = await m.quoted.download();
  const links = await applyDreadedEffect(effect, imageBuffer);

  if (!Array.isArray(links) || links.length === 0) {
    return m.reply("❌ Failed to apply filter. Try again later.");
  }

  const preferredOrder = ["large", "regular", "small"];
  const selected = preferredOrder
    .map(size => links.find(l => l.size.toLowerCase() === size))
    .find(Boolean) || links[0];

  await client.sendMessage(m.chat, {
    image: { url: selected.url },
    caption: `✨ *${effect}* filter applied (${selected.size})`
  }, { quoted: m });
});

// Emoji Mix Command
dreaded({
  pattern: "emix",
  desc: "Combine two emojis into a sticker",
  category: "Editting",
  filename: __filename
}, async ({ client, m, text, botname }) => {
  try {
    if (!text) return m.reply("Provide emojis separated by '+'\nExample: .emix 😊+😢");

    const emojis = text.split('+');
    if (emojis.length !== 2) return m.reply("Please provide exactly 2 emojis separated by '+'");

    const [emoji1, emoji2] = emojis.map(e => e.trim());
    const { data } = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

    if (!data.status) return m.reply("Failed to create emoji mix");

    const sticker = new Sticker(data.result, {
      pack: botname,
      type: StickerTypes.CROPPED,
      categories: ["🤩", "🎉"],
      quality: 70,
      background: "transparent"
    });

    await client.sendMessage(m.chat, { 
      sticker: await sticker.toBuffer() 
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply("Error creating emoji mix");
  }
});

// HD Image Enhancement Command
dreaded({
  pattern: "hd",
  desc: "Enhance image quality to HD",
  category: "Editting",
  filename: __filename
}, async ({ client, m, mime }) => {
  try {
    if (!/image/.test(mime)) return m.reply("Reply to an image");

    const media = await m.quoted.download();
    const enhancedImage = await enhanceWithVyro(media, "enhance");

    await client.sendMessage(m.chat, {
      image: enhancedImage,
      caption: '🔼 Enhanced to HD Quality'
    }, { quoted: m });

  } catch (error) {
    console.error("HD Error:", error);
    m.reply("Failed to enhance image");
  }
});

// Helper Function for HD Command
async function enhanceWithVyro(imageBuffer, effect = "enhance") {
  const form = new FormData();
  const url = `https://vyro.ai/${effect}`;

  form.append("model_version", 1, {
    "Content-Transfer-Encoding": "binary",
    contentType: "multipart/form-data"
  });

  form.append("image", imageBuffer, {
    filename: "enhance_image_body.jpg",
    contentType: "image/jpeg"
  });

  const { data } = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
      "User-Agent": "okhttp/4.9.3"
    }
  });
  return data;
}

// Hitler Command (Meme Generator)
dreaded({
  pattern: "hitler",
  desc: "Add profile picture to Hitler meme template",
  category: "Editting",
  filename: __filename
}, async ({ client, m, Tag, botname }) => {
  try {
    let cap = `Converted By ${botname}`;
    let img;

    if (m.quoted) {
      try {
        img = await client.profilePictureUrl(m.quoted.sender, 'image');
      } catch {
        img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
      }
    } else if (Tag) {
      try {
        img = await client.profilePictureUrl(Tag[0] || m.sender, 'image');
      } catch {
        img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg";
      }
    } else {
      return m.reply("Reply to a user or tag someone!");
    }

    const result = await canvacord.Canvacord.hitler(img);
    await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("Failed to generate meme. 😞");
  }
});

// LogoGen Command (AI Logo Generator)
dreaded({
  pattern: "logogen",
  desc: "Generate professional logos with AI",
  category: "Editting",
  filename: __filename
}, async ({ client, m, text }) => {
  try {
    if (!text) {
      return m.reply("Format: _logogen Title|Idea|Slogan_\nExample: _logogen DreadedTech|AI Services|Innovation Simplified_");
    }

    const [title, idea, slogan] = text.split("|");
    if (!title || !idea || !slogan) {
      return m.reply("Invalid format! Use: _logogen Title|Idea|Slogan_");
    }

    const payload = {
      ai_icon: [333276, 333279],
      height: 300,
      idea,
      industry_index: "N",
      title,
      slogan,
      width: 400,
      whiteEdge: 80,
      pagesize: 4
    };

    const { data } = await axios.post("https://www.sologo.ai/v1/api/logo/logo_generate", payload);
    if (!data.data?.logoList?.length) {
      return m.reply("No logos generated. Try again later.");
    }

    for (const logo of data.data.logoList.slice(0, 4)) {
      await client.sendMessage(m.chat, {
        image: { url: logo.logo_thumb },
        caption: `🎨 *${title}* Logo\n💡 Idea: ${idea}\n✨ Slogan: ${slogan}`
      }, { quoted: m });
    }

  } catch (err) {
    console.error("LogoGen Error:", err);
    m.reply("AI failed to design logos. Try again!");
  }
});

// Negro Command (Black Filter Effect)
dreaded({
  pattern: "negro",
  desc: "Apply black filter to images",
  category: "Editting",
  filename: __filename
}, async ({ client, m, mime }) => {
  try {
    if (!m.quoted || !/image/.test(mime)) {
      return m.reply("Reply to an image with *negro* to apply the filter!");
    }

    const buffer = await m.quoted.download();
    const { data } = await axios.post("https://negro.consulting/api/process-image", {
      filter: "hitam",
      imageData: `data:image/png;base64,${buffer.toString('base64')}`
    });

    const resultBuffer = Buffer.from(
      data.processedImageUrl.replace("data:image/png;base64,", ""),
      "base64"
    );

    await client.sendMessage(m.chat, {
      image: resultBuffer,
      caption: "⬛ *Black Filter Applied*"
    }, { quoted: m });

  } catch (error) {
    console.error("Negro Filter Error:", error);
    m.reply("Failed to process image. The API might be down.");
  }
});

// Remove Background Command
dreaded({
  pattern: "removebg",
  desc: "Remove image background",
  category: "Editting",
  filename: __filename
}, async ({ client, m, mime, uploadtoimgur }) => {
  try {
    if (!m.quoted || !/image/.test(mime)) {
      return m.reply("Reply to an image to remove its background");
    }

    m.reply("Processing image... Please wait");
    const imagePath = await client.downloadAndSaveMediaMessage(m.quoted);
    const imageUrl = await uploadtoimgur(imagePath);
    const resultUrl = `https://api.dreaded.site/api/removebg?imageurl=${imageUrl}`;

    await client.sendMessage(m.chat, { 
      image: { url: resultUrl }, 
      caption: "Background removed successfully!" 
    }, { quoted: m });

  } catch (error) {
    console.error("RemoveBG Error:", error);
    m.reply("Failed to remove background. The service might be unavailable.");
  }
});

// RIP Command (Tombstone Meme)
dreaded({
  pattern: "rip",
  desc: "Create tombstone meme with profile picture",
  category: "Editting",
  filename: __filename
}, async ({ client, m, Tag, botname }) => {
  try {
    let img;
    if (m.quoted) {
      img = await client.profilePictureUrl(m.quoted.sender, 'image').catch(() => 
        "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
      );
    } else if (Tag) {
      img = await client.profilePictureUrl(Tag[0] || m.sender, 'image').catch(() => 
        "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
      );
    } else {
      return m.reply("Reply to a user or mention someone!");
    }

    const result = await canvacord.Canvacord.rip(img);
    await client.sendMessage(m.chat, { 
      image: result, 
      caption: `RIP Meme | Created by ${botname}` 
    }, { quoted: m });

  } catch (e) {
    console.error("RIP Error:", e);
    m.reply("Failed to create meme. Try again later.");
  }
});

// Shit Command (Poop Meme)
dreaded({
  pattern: "shit",
  desc: "Create poop meme with profile picture",
  category: "Editting",
  filename: __filename
}, async ({ client, m, Tag, botname }) => {
  try {
    let img;
    if (m.quoted) {
      img = await client.profilePictureUrl(m.quoted.sender, 'image').catch(() => 
        "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
      );
    } else if (Tag) {
      img = await client.profilePictureUrl(Tag[0] || m.sender, 'image').catch(() => 
        "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
      );
    } else {
      return m.reply("Reply to a user or mention someone!");
    }

    const result = await canvacord.Canvacord.shit(img);
    await client.sendMessage(m.chat, { 
      image: result, 
      caption: `Poop Meme | Created by ${botname}` 
    }, { quoted: m });

  } catch (e) {
    console.error("Shit Error:", e);
    m.reply("Failed to create meme. Try again later.");
  }
});

// Sticker Command
dreaded({
  pattern: "sticker",
  desc: "Convert images/videos to stickers",
  category: "Editting",
  filename: __filename
}, async ({ client, m, packname, author }) => {
  try {
    if (!m.quoted) return m.reply("Reply to an image/video to convert");



    const quoted = m.msg.contextInfo.quotedMessage;
    if (!quoted?.imageMessage && !quoted?.videoMessage) {
      return m.reply("Only images/short videos can be converted");
    }

    const mediaPath = await client.downloadAndSaveMediaMessage(m.quoted);
    const sticker = new Sticker(mediaPath, {
      pack: packname,
      author: author,
      type: StickerTypes.FULL,
      quality: 70,
      categories: ["🤩", "🎉"],
      background: "transparent"
    });

    await client.sendMessage(m.chat, { 
      sticker: await sticker.toBuffer() 
    }, { quoted: m });

  } catch (error) {
    console.error("Sticker Error:", error);
    m.reply("Failed to create sticker. Check media format/size.");
  }
});

dreaded({
  pattern: "take",
  desc: "Take command",
  category: "Editting",
  filename: __filename
}, async ({ client, m, pushname}) => {
  
 
  
    const quotedMessage = m.msg?.contextInfo?.quotedMessage;
    if (!quotedMessage) {
      m.reply('Quote an image, a short video or a sticker to change watermark.');
      return;
    }
  
    let media;
    if (quotedMessage.imageMessage) {
      media = quotedMessage.imageMessage;
    } else if (quotedMessage.videoMessage) {
      media = quotedMessage.videoMessage;
    } else if (quotedMessage.stickerMessage) {
      media = quotedMessage.stickerMessage;
    } else {
      m.reply('This is neither a sticker, image nor a video...');
      return;
    }
  
    const result = await client.downloadAndSaveMediaMessage(media);
  
    const stickerResult = new Sticker(result, {
      pack: pushname,
      author: pushname,
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
      background: "transparent",
    });
  
    const Buffer = await stickerResult.toBuffer();
    client.sendMessage(m.chat, { sticker: Buffer }, { quoted: m });
});





dreaded({
  pattern: "trash",
  desc: "Trash command",
  category: "Editting",
  filename: __filename
}, async ({ client, m, Tag, botname }) => {
        
  
  let cap = `Converted By ${botname}`;
  
  try {
  
          if (m.quoted) {
              try {
                  img = await client.profilePictureUrl(m.quoted.sender, 'image')
              } catch {
                  img = "https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg"
              }
                          result = await canvacord.Canvacord.trash(img);
          } else if (Tag) {
              try {
                  ppuser = await client.profilePictureUrl(Tag[0] || m.sender, 'image')
              } catch {
                  ppuser = 'https://telegra.ph/file/9521e9ee2fdbd0d6f4f1c.jpg'
              }
                          result = await canvacord.Canvacord.trash(ppuser);
          } 
  
  
          await client.sendMessage(m.chat, { image: result, caption: cap }, { quoted: m });
  
  } catch (e) {
  
  m.reply("Something wrong occured. 😞")  
  
  }
});
