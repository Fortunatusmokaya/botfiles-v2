const { smsg } = require('../Handler/smsg');
const { getGroupSetting, getSettings, getBannedUsers, banUser } = require("../Database/adapter");
const handleDreaded = require("../Client/dreaded");

module.exports = (client, store, groupCache) => async (chatUpdate) => {
  const settings = await getSettings();
  if (!settings) return;

  const { autoread, autolike, autoview, presence } = settings;

  try {
    let mek = chatUpdate.messages[0];
    if (!mek.message) return;

    const m = smsg(client, mek, store);
    mek.message = Object.keys(mek.message)[0] === "ephemeralMessage"
      ? mek.message.ephemeralMessage.message
      : mek.message;

    const messageContent = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
    const isGroup = mek.key.remoteJid.endsWith("@g.us");
    const sender = mek.key.participant || mek.key.remoteJid;
    const botNumber = await client.decodeJid(client.user.id);

    if (isGroup) {
      const groupSettings = await getGroupSetting(mek.key.remoteJid);
      const antilink = groupSettings?.antilink;
      const linkRegex = /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|bit\.ly\/|discord\.gg\/)[^\s]+/i;
      const containsLink = linkRegex.test(messageContent);

      if ((antilink === true || antilink === 'true') && containsLink) {
        const context = await client.getGroupContext(m, botNumber);
        const { isAdmin, isBotAdmin, groupSender } = context;

        if (!isBotAdmin) return;
        if (!isAdmin) {
          await client.sendMessage(mek.key.remoteJid, {
            text: `🚫 @${groupSender.split("@")[0]}, sending links is prohibited! You have been removed.`,
            contextInfo: { mentionedJid: [sender] }
          }, { quoted: mek });

          await client.groupParticipantsUpdate(mek.key.remoteJid, [groupSender], "remove");
          await client.sendMessage(mek.key.remoteJid, {
            delete: {
              remoteJid: mek.key.remoteJid,
              fromMe: false,
              id: mek.key.id,
              participant: groupSender
            }
          });
        }
      }
    }

    if (mek.message?.protocolMessage?.key) {
      const nickkk = await client.decodeJid(client.user.id);
      const { handleMessageRevocation } = require('../Functions/antidelete');
      await handleMessageRevocation(client, mek, nickkk); 
    } else {
      const { handleIncomingMessage } = require('../Functions/antidelete');
      handleIncomingMessage(mek);
    }

    if (autolike && mek.key.remoteJid === "status@broadcast") {
      const emojis = ['💗', '🧠', '🧸', '📍'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await client.sendMessage(mek.key.remoteJid, {
        react: { text: randomEmoji, key: mek.key }
      });
    }

    if (autoview && mek.key.remoteJid === "status@broadcast") {
      await client.readMessages([mek.key]);
    } else if (autoread && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
      await client.readMessages([mek.key]);
    }

const presenceMap = {
  typing: 'composing',
  recording: 'recording',
  online: 'available',
  offline: 'unavailable'
};

if (presence && mek.key.remoteJid.endsWith('@s.whatsapp.net')) {
  const mappedPresence = presenceMap[presence];
  if (mappedPresence) {
    await client.sendPresenceUpdate(mappedPresence, mek.key.remoteJid);
  }
}

    if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

    handleDreaded(client, m, chatUpdate, store);
  } catch (err) {
    console.error("❌ Error in message handler:", err);
  }
};