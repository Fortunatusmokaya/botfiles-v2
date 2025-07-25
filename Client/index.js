
const {
    default: dreadedConnect,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadContentFromMessage,
    jidDecode,
    proto,
    getContentType,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 10000;
const NodeCache =require("node-cache");
const { sleep } = require('../lib/botFunctions');
const handleDreaded = require("./dreaded");
const { 
    handleIncomingMessage, 
    handleMessageRevocation 
} = require('../Functions/antidelete');
const { initializeClientUtils } = require('../Client/clientUtils'); 

const logger = pino({
    level: 'silent' 
});

const makeInMemoryStore = require('../Client/store.js'); 
const store = makeInMemoryStore({
    logger: logger.child({
        stream: 'store'
    })
});

const groupCache = require("../Client/groupCache");
const authenticationn = require('../Auth/auth.js');
authenticationn();

const path = require('path');
const sessionName = path.join(__dirname, '..', 'Session'); 

const groupEvents = require("../Handler/eventHandler");
const groupEvents2 = require("../Handler/eventHandler2");
const connectionHandler = require('../Handler/connectionHandler');
const handleMessageHandler = require('../Handler/messageHandler');
const handleGroupParticipants = require('../Handler/groupParticipantHandler');
const handleCall = require('../Handler/callHandler');


async function startDreaded() {
    
    
    const { saveCreds, state } = await useMultiFileAuthState(sessionName);
    const client = dreadedConnect({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        version: [2, 3000, 1023223821],
        browser: ['DREADED', 'Safari', '3.0'],
        fireInitQueries: false,
        shouldSyncHistoryMessage: true,
        downloadHistory: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 30_000,
        auth: state,
        
        cachedGroupMetadata: async (jid) => {
            const cached = groupCache.get(jid);
            if (cached) {
                return cached;
            }
            return null;
        },
        
        getMessage: async (key) => {
            if (store) {
                const mssg = await store.loadMessage(key.remoteJid, key.id);
                return mssg.message || undefined;
            }
            return {
                conversation: "HERE"
            };
        }
    });

    initializeClientUtils(client, store, groupCache);
    store.bind(client.ev);

    setInterval(() => { 
        store.writeToFile("store.json"); 
    }, 30000);

    client.ev.on("connection.update", async (update) => {
        await connectionHandler(client, update, startDreaded);
    }); 
    
    client.ev.on("group-participants.update", handleGroupParticipants(client, groupCache));
    client.ws.on("CB:call", handleCall(client));
    client.ev.on("messages.upsert", handleMessageHandler(client, store, groupCache));
    
    // Handle error
    const unhandledRejections = new Map();
    process.on("unhandledRejection", (reason, promise) => {
        unhandledRejections.set(promise, reason);
        console.log("Unhandled Rejection at:", promise, "reason:", reason);
    });
    
    process.on("rejectionHandled", (promise) => {
        unhandledRejections.delete(promise);
    });
    
    process.on("Something went wrong", function (err) {
        console.log("Caught exception: ", err);
    });

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);
    client.ev.on("creds.update", saveCreds);
}

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html'); 
});

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});

startDreaded();

module.exports = startDreaded;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});