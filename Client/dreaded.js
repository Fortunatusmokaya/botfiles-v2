const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const speed = require("performance-now");
const { smsg, formatp, tanggal, formatDate, getTime, sleep, clockString, fetchJson, getBuffer, jsonformat, generateProfilePicture, parseMention, getRandom, fetchBuffer } = require('../lib/botFunctions.js');
const { exec, spawn, execSync } = require("child_process");
const { TelegraPh, UploadFileUgu } = require("../lib/toUrl");
const uploadtoimgur = require('../lib/Imgur');
const { readFileSync } = require('fs');
const { commands, aliases, totalCommands } = require('../Handler/commandHandler');
const status_saver = require('../Functions/status_saver');
const gcPresence = require('../Functions/gcPresence');
const antitaggc = require('../Functions/antitag');
const { getSettings, getSudoUsers, getBannedUsers } = require("../Database/adapter");
const { botname, mycode } = require('../Env/settings');
const path = require('path');

const mentionRegex = /[^0-9]/g;
const whatsappSuffixRegex = /@s\.whatsapp\.net$/;
const whitespaceRegex = /\s+/;

const filePath = path.resolve(__dirname, '../dreaded.jpg');
let pict;
try {
    pict = readFileSync(filePath);
} catch (err) {
    pict = Buffer.alloc(0);
}

const commandCache = new Map();
const settingsCache = { lastFetch: 0, data: null, ttl: 30000 };
const ignorableErrors = [
    "conflict",
    "not-authorized",
    "Socket connection timeout",
    "rate-overlimit",
    "Connection Closed",
    "Timed Out",
    "Value not found"
];

module.exports = dreaded = async (client, m, chatUpdate, store) => {
    try {
        const botNumber = await client.decodeJid(client.user.id);
        const { groupMetadata, groupName, participants, groupAdmin, isBotAdmin, groupSender, isAdmin } = await client.getGroupContext(m, botNumber);

        const [sudoUsers, bannedUsers, settings] = await Promise.all([
            getSudoUsers(),
            getBannedUsers(),
            (settingsCache.data && Date.now() - settingsCache.lastFetch < settingsCache.ttl) 
                ? settingsCache.data 
                : getSettings().then(s => {
                    settingsCache.data = s;
                    settingsCache.lastFetch = Date.now();
                    return s;
                })
        ]);

        if (!settings) return;

        const { prefix, mode, gcpresence, antitag, antidelete, antilink, packname } = settings;

        const getBody = (m) => {
            const msg = m.message;
            switch (m.mtype) {
                case "conversation": return msg.conversation;
                case "imageMessage": return msg.imageMessage?.caption || "";
                case "extendedTextMessage": return msg.extendedTextMessage?.text || "";
                default: return "";
            }
        };

        const body = getBody(m);
        const Tag = m.mtype == "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null  
            ? m.message.extendedTextMessage.contextInfo.mentionedJid : [];
        const budy = typeof m.text == "string" ? m.text : "";
        const timestamp = speed();
        const dreadedspeed = speed() - timestamp;

        let cmd = null;
        if (body.startsWith(prefix)) {
            const cacheKey = body.slice(prefix.length).trim();
            if (commandCache.has(cacheKey)) {
                cmd = commandCache.get(cacheKey);
            } else {
                const commandName = cacheKey.split(whitespaceRegex)[0].toLowerCase();
                const resolvedCommandName = aliases[commandName] || commandName;
                cmd = commands[resolvedCommandName];
                commandCache.set(cacheKey, cmd);
            }
        }

        const args = body.trim().split(whitespaceRegex).slice(1);
        const pushname = m.pushName || "No Name";
        const itsMe = m.sender == botNumber;
        const text = args.join(" ");
        const arg = budy.trim().substring(budy.indexOf(" ") + 1);
        const arg1 = arg.trim().substring(arg.indexOf(" ") + 1);
        const fortu = m.quoted || m;
        const quoted = (fortu.mtype == 'buttonsMessage') ? fortu[Object.keys(fortu)[1]] : (fortu.mtype == 'templateMessage') ? fortu.hydratedTemplate[Object.keys(fortu.hydratedTemplate)[1]] : (fortu.mtype == 'product') ? fortu[Object.keys(fortu)[0]] : m.quoted ? m.quoted : m;
        const color = (text, color) => !color ? chalk.green(text) : chalk.keyword(color)(text);
        const mime = (quoted.msg || quoted).mimetype || "";
        const qmsg = quoted.msg || quoted;
        const sender = m.sender;
        const IsGroup = m.chat?.endsWith("@g.us");
        const DevDreaded = Array.isArray(sudoUsers) ? sudoUsers : [];
        const Owner = DevDreaded.map(v => v.replace(mentionRegex, "") + "@s.whatsapp.net").includes(groupSender);

        const userJid = groupSender?.replace(whatsappSuffixRegex, '') || m.sender?.replace(whatsappSuffixRegex, '') || '';

const userStatus = {
    isMe: itsMe,
    isOwner: Owner,
    isSudo: sudoUsers.includes(userJid),
    isBanned: bannedUsers.includes(userJid)
};

        if (cmd && userStatus.isBanned) {
            await client.sendMessage(m.chat, { text: "❗You are banned from using bot commands." }, { quoted: m });
            return;
        }

        if (cmd && mode === 'private' && !userStatus.isMe && !userStatus.isOwner && !userStatus.isSudo) {
            return;
        }

        const context = {
            client, m, text, Owner: userStatus.isOwner, chatUpdate, store, isBotAdmin, isAdmin, IsGroup, participants,
            pushname, body, budy, totalCommands, args, mime, qmsg, botNumber, itsMe: userStatus.isMe,
            packname, generateProfilePicture, groupMetadata, dreadedspeed, mycode,
            fetchJson, exec, getRandom, UploadFileUgu, TelegraPh, prefix, cmd, botname, mode,
            gcpresence, antitag, antidelete, fetchBuffer, uploadtoimgur, groupSender, pict, Tag
        };

        await Promise.all([
            status_saver(client, m, Owner, prefix),
            gcPresence(client, m),
            antitaggc(client, m, isBotAdmin, itsMe, isAdmin, Owner, body)
        ]);

        if (cmd) await cmd(context);
    } catch (err) {
        console.log(util.format(err));
    }
};

process.on('uncaughtException', function(err) {
    const e = String(err);
    if (ignorableErrors.some(pattern => e.includes(pattern))) return;
    console.log('Caught exception: ', err);
});