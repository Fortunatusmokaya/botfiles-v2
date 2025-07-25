const { Boom } = require("@hapi/boom");
const { DateTime } = require("luxon");
const {
  default: dreadedConnect,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const { database, botname } = require("../Env/settings");
const { getSettings, addSudoUser, getSudoUsers, initializeDatabase } = require("../Database/adapter");
const { commands, totalCommands } = require("../Handler/commandHandler");
const groupCache = require("../Client/groupCache");

const connectionHandler = async (client, update, startDreaded) => {
  const { connection, lastDisconnect } = update;

  const settings = await getSettings();
  const { autobio } = settings;
  
  const getGreeting = () => {
    const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
    if (currentHour >= 5 && currentHour < 12) return "Good morning 🌄";
    if (currentHour >= 12 && currentHour < 18) return "Good afternoon ☀️";
    if (currentHour >= 18 && currentHour < 22) return "Good evening 🌆";
    return "Good night 😴";
  };

  const getCurrentTimeInNairobi = () => {
    return DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE);
  };

  if (connection === "connecting") {
    console.log("📈 Connecting to WhatsApp and database...");
  }

  if (connection === "close") {
    const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

    
    if (groupCache) {
      groupCache.flushAll();
      console.log("🗑️ Group cache cleared due to connection close");
    }

    const reasonHandlers = {
      [DisconnectReason.badSession]: () => {
        console.log("❌ Bad Session File, Please Delete Session and Scan Again");
        process.exit();
      },
      [DisconnectReason.connectionClosed]: () => {
        console.log("🔌 Connection closed. Reconnecting...");
        startDreaded();
      },
      [DisconnectReason.connectionLost]: () => {
        console.log("📴 Connection lost. Reconnecting...");
        startDreaded();
      },
      [DisconnectReason.timedOut]: () => {
        console.log("⌛ Connection timed out. Reconnecting...");
        startDreaded();
      },
      [DisconnectReason.connectionReplaced]: () => {
        console.log("🔁 Connection replaced. Please restart bot.");
        process.exit();
      },
      [DisconnectReason.loggedOut]: () => {
        console.log("🔒 Logged out. Please delete session and scan again.");
        process.exit();
      },
      [DisconnectReason.restartRequired]: () => {
        console.log("♻️ Restart required. Restarting...");
        startDreaded();
      }
    };

    const handleDisconnect = reasonHandlers[statusCode];
    if (handleDisconnect) {
      handleDisconnect();
    } else {
      console.log(`❓ Unknown disconnect reason: ${statusCode} | ${connection}`);
      startDreaded();
    }
  }

  if (connection === "open") {



    if (database) {
      console.log("📈 Connecting to PostgreSQL database...");
      try {
      await initializeDatabase();
      console.log("📉 Connected to PostgreSQL database.");
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error.message);
    }
    } else {
      console.log("📦 Using JSON settings database (no PostgreSQL URL found).");
    }

    await client.groupAcceptInvite("HPik6o5GenqDBCosvXW3oe");

    
    if (groupCache) {
      try {
      
        const groups = await client.groupFetchAllParticipating();
       
        
        for (const [jid, groupInfo] of Object.entries(groups)) {
          groupCache.set(jid, groupInfo);
        }
        
        console.log(`✅ Successfully cached metadata for ${Object.keys(groups).length} groups`);
      } catch (error) {
        console.error("❌ Error caching group metadata on connection open:", error);
      }
    }

    const Myself = client.user.id.replace(/:.*/, "").split("@")[0];
    const currentDevs = await getSudoUsers();

    if (!currentDevs.includes(Myself)) {
      await addSudoUser(Myself);
      let newSudoMessage = `Holla, ${getGreeting()},\n\nYou are connected to dreaded bot. 📡\n\n`;
      newSudoMessage += `👤 BOTNAME:- ${botname}\n`;
      newSudoMessage += `🔓 MODE:- ${settings.mode}\n`;
      newSudoMessage += `✍️ PREFIX:- ${settings.prefix}\n`;
      newSudoMessage += `📝 COMMANDS:- ${totalCommands}\n`;
      newSudoMessage += `🕝 TIME:- ${getCurrentTimeInNairobi()}\n`;
      newSudoMessage += `💡 LIBRARY:- Baileys\n\n`;
      newSudoMessage += `▞▚▞▚▞▚▞▚▞▚▞▚▞\n\n`;
      newSudoMessage += `Looks like this is your first connection with this database, so we are gonna add you to sudo users.\n\n`;
      newSudoMessage += `Now use the *${settings.prefix}settings* command to customize your bot settings.\n`;
      newSudoMessage += `To access all commands, use *${settings.prefix}menu*\n`;
      newSudoMessage += `.....and maybe 🤔 thank you 🗿`;

      await client.sendMessage(client.user.id, { text: newSudoMessage });
    } else {
      let message = `Holla, ${getGreeting()},\n\nYou are connected to dreaded bot. 📡\n\n`;
      message += `👤 BOTNAME:- ${botname}\n`;
      message += `🔓 MODE:- ${settings.mode}\n`;
      message += `✍️ PREFIX:- ${settings.prefix}\n`;
      message += `📝 COMMANDS:- ${totalCommands}\n`;
      message += `🕝 TIME:- ${getCurrentTimeInNairobi()}\n`;
      message += `💡 LIBRARY:- Baileys\n\n`;
      message += `▞▚▞▚▞▚▞▚▞▚▞▚▞`;
      await client.sendMessage(client.user.id, { text: message });
    }

    console.log(`✅ WhatsApp and ${database ? 'PostgreSQL' : 'JSON'} database connection successful`);
    console.log(`Loaded ${totalCommands} commands.\nBot is active!`);
  }
};

module.exports = connectionHandler;