const { downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
const fs = require("fs");
const FileType = require("file-type");
const PhoneNumber = require("awesome-phonenumber");
const groupCache = require("../Client/groupCache");

function initializeClientUtils(client, store) {
  client.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  client.getName = (jid, withoutContact = false) => {
    const id = client.decodeJid(jid);
    withoutContact = client.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us")) {
      return new Promise(async (resolve) => {
        try {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) {
            let groupMetadata = groupCache.get(id);
            if (!groupMetadata) {
              groupMetadata = await client.groupMetadata(id);
              groupCache.set(id, groupMetadata);
            }
            v = groupMetadata || {};
          }
          resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
        } catch (error) {
          resolve(PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
        }
      });
    } else {
      v = id === "0@s.whatsapp.net"
        ? { id, name: "WhatsApp" }
        : id === client.decodeJid(client.user.id)
        ? client.user
        : store.contacts[id] || {};
      return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
    }
  };

  client.sendText = (jid, text, quoted = "", options = {}) => {
    return client.sendMessage(jid, { text: text, ...options }, { quoted });
  };

  client.downloadMediaMessage = async (message) => {
    try {
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    } catch (error) {
      throw error;
    }
  };

  client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    try {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || '';
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      let type = await FileType.fromBuffer(buffer);
      const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    } catch (error) {
      throw error;
    }
  };

  client.cacheGroupMetadata = async (groupJid) => {
    try {
      const metadata = await client.groupMetadata(groupJid);
      groupCache.set(groupJid, metadata);
      return metadata;
    } catch (error) {
      return null;
    }
  };

  client.getCachedGroupMetadata = (groupJid) => {
    return groupCache.get(groupJid);
  };

  client.clearGroupCache = (groupJid) => {
    return groupCache.del(groupJid);
  };

  client.getCacheStats = () => {
    return {
      keys: groupCache.keys().length,
      stats: groupCache.getStats()
    };
  };

  client.sendMessageWithRetry = async (jid, content, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await client.sendMessage(jid, content, options);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  client.isGroup = (jid) => {
    return jid.endsWith("@g.us");
  };

  client.isPrivateChat = (jid) => {
    return jid.endsWith("@s.whatsapp.net");
  };

  client.getGroupAdmins = async (groupJid) => {
    try {
      if (!client.isGroup(groupJid)) return [];
      let groupMetadata = groupCache.get(groupJid);
      if (!groupMetadata) {
        groupMetadata = await client.groupMetadata(groupJid);
        groupCache.set(groupJid, groupMetadata);
      }
      return groupMetadata.participants.filter(p => p.admin).map(p => p.id);
    } catch (error) {
      return [];
    }
  };

  client.isGroupAdmin = async (groupJid, userJid) => {
    try {
      const admins = await client.getGroupAdmins(groupJid);
      return admins.includes(userJid);
    } catch (error) {
      return false;
    }
  };

  client.getGroupContext = async (m, botNumber) => {
    if (!m.isGroup) {
      return {
        groupMetadata: null,
        groupName: "",
        participants: [],
        groupAdmin: [],
        isBotAdmin: false,
        groupSender: m.sender,
        isAdmin: false
      };
    }
    try {
      let groupMetadata = groupCache.get(m.chat);
      if (!groupMetadata) {
        groupMetadata = await client.groupMetadata(m.chat);
        groupCache.set(m.chat, groupMetadata);
      }
      const groupName = groupMetadata.subject || "";
      const participants = groupMetadata.participants.map(p => p.pn);
      const groupAdmin = groupMetadata.participants.filter(p => p.admin).map(p => p.pn);
      const senderLid = client.decodeJid(m.sender);
      const found = groupMetadata.participants.find(p => p.id === senderLid);
      const groupSender = found?.pn;
      const isBotAdmin = groupAdmin.includes(client.decodeJid(botNumber));
      const isAdmin = groupAdmin.includes(groupSender);

      return {
        groupMetadata,
        groupName,
        participants,
        groupAdmin,
        isBotAdmin,
        groupSender,
        isAdmin,
        getJidFromLid: (lid) => {
          const match = groupMetadata.participants.find(p => p.lid === lid || p.id === lid);
          return match?.pn || null;
        }
      };
    } catch (error) {
      return {
        groupMetadata: null,
        groupName: "",
        participants: [],
        groupAdmin: [],
        isBotAdmin: false,
        groupSender: m.sender,
        isAdmin: false,
        getJidFromLid: () => null
      };
    }
  };

  client.getJidFromLid = (groupMetadata, lid) => {
    const match = groupMetadata.participants.find(p => p.lid === lid || p.id === lid);
    return match?.pn || null;
  };
}

module.exports = {
  initializeClientUtils
};