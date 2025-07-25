const fs = require('fs');
const path = require('path');

const baseDir = 'message_data';
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

function loadChatData(remoteJid, messageId) {
  const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
  try {
    const data = fs.readFileSync(chatFilePath, 'utf8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

function saveChatData(remoteJid, messageId, chatData) {
  const chatDir = path.join(baseDir, remoteJid);
  if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir, { recursive: true });
  }
  const chatFilePath = path.join(chatDir, `${messageId}.json`);
  try {
    fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
  } catch (error) {
    console.error('Error saving chat data:', error);
  }
}

function handleIncomingMessage(message) {
  const remoteJid = message.key.remoteJid;
  const messageId = message.key.id;

  const chatData = loadChatData(remoteJid, messageId);
  chatData.push(message);
  saveChatData(remoteJid, messageId, chatData);
}

function getEastAfricaTimestamp() {
  const now = new Date();
  const eastAfricaTime = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));
  return eastAfricaTime.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
}

async function handleMessageRevocation(client, revocationMessage, botNumber) {
  const remoteJid = revocationMessage.key.remoteJid;
  const messageId = revocationMessage.message?.protocolMessage?.key?.id;
  if (!messageId) return;

  const chatData = loadChatData(remoteJid, messageId);
  const originalMessage = chatData[0];
  if (!originalMessage) return;

  let deletedBy = revocationMessage.participant || revocationMessage.key.participant || remoteJid;
  let sentBy = originalMessage.key.participant || originalMessage.key.remoteJid;

  let groupName = remoteJid;
  let isGroup = remoteJid.endsWith('@g.us');
  let convertedJid = deletedBy;

  
  if (isGroup) {
    const fakeM = { chat: remoteJid, isGroup: true, sender: deletedBy };
    const groupContext = await client.getGroupContext(fakeM, client.user.id);

    groupName = groupContext?.groupName || remoteJid;

   
    if (deletedBy?.endsWith('@lid') && typeof groupContext.getJidFromLid === 'function') {
      try {
        convertedJid = await groupContext.getJidFromLid(deletedBy);
      } catch (e) {
        console.warn('Failed to convert deletedBy LID:', deletedBy);
      }
    }

    
    if (sentBy?.endsWith('@lid') && typeof groupContext.getJidFromLid === 'function') {
      try {
        sentBy = await groupContext.getJidFromLid(sentBy);
      } catch (e) {
        console.warn('Failed to convert sentBy LID:', sentBy);
      }
    }
  }

  
  if (convertedJid?.includes(botNumber)) return;

  const deletedByFormatted = `@${convertedJid.split('@')[0]}`;
  const timestamp = getEastAfricaTimestamp();

  let notificationText = `_ANTIDELETE_\n\n`;

  if (remoteJid.includes('status@broadcast')) {
    notificationText += `Status Update deleted by ${deletedByFormatted}\n\nTime: ${timestamp}\n\n`;
  } else if (remoteJid.endsWith('@s.whatsapp.net')) {
    notificationText += `Private Message deleted by ${deletedByFormatted}\n\nTime: ${timestamp}\n\n`;
  } else if (remoteJid.endsWith('@g.us')) {
    notificationText += `Message deleted by ${deletedByFormatted} in ${groupName}\n\nTime: ${timestamp}\n\n`;
  }

  try {
    const m = originalMessage.message;
    const userJid = client.user.id;

    if (m.conversation) {
      notificationText += `Deleted Message: ${m.conversation}`;
      return await client.sendMessage(userJid, {
  text: notificationText,
  mentions: [convertedJid]
});
    }

    if (m.extendedTextMessage) {
      notificationText += `Deleted Content: ${m.extendedTextMessage.text}`;
      return await client.sendMessage(userJid, { text: notificationText });
    }

    const getMediaReply = (mediaMessage, caption = "") => {
      const finalCaption = caption ? `${notificationText}\n\nCaption: ${caption}` : notificationText;
      return {
        caption: finalCaption,
        contextInfo: {
          externalAdReply: {
            title: 'Deleted Message',
            body: `Time: ${timestamp}`,
            thumbnailUrl: "https://files.catbox.moe/z34m2h.jpg",
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      };
    };

    if (m.imageMessage) {
      const buffer = await client.downloadMediaMessage(m.imageMessage);
      return await client.sendMessage(userJid, {
        image: buffer,
        ...getMediaReply(m.imageMessage, m.imageMessage.caption)
      });
    }

    if (m.videoMessage) {
      const buffer = await client.downloadMediaMessage(m.videoMessage);
      return await client.sendMessage(userJid, {
        video: buffer,
        ...getMediaReply(m.videoMessage, m.videoMessage.caption)
      });
    }

    if (m.stickerMessage) {
      const buffer = await client.downloadMediaMessage(m.stickerMessage);
      return await client.sendMessage(userJid, {
        sticker: buffer,
        contextInfo: getMediaReply().contextInfo
      });
    }

    if (m.documentMessage) {
      const buffer = await client.downloadMediaMessage(m.documentMessage);
      return await client.sendMessage(userJid, {
        document: buffer,
        fileName: m.documentMessage.fileName,
        mimetype: m.documentMessage.mimetype,
        ...getMediaReply(m.documentMessage)
      });
    }

    if (m.audioMessage) {
      const buffer = await client.downloadMediaMessage(m.audioMessage);
      return await client.sendMessage(userJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        ptt: m.audioMessage.ptt === true,
        caption: notificationText,
        contextInfo: getMediaReply().contextInfo
      });
    }

  } catch (error) {
    console.error('Error handling deleted message:', error);
    notificationText += `\n\n⚠️ Error recovering deleted content.`;
    await client.sendMessage(client.user.id, { text: notificationText });
  }
}

module.exports = {
  handleIncomingMessage,
  handleMessageRevocation
};