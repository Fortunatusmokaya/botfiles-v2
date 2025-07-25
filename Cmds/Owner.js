const dreaded = global.dreaded;
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { execSync } = require('child_process');
const axios = require('axios');


dreaded({
  pattern: "checkupdate",
  desc: "Check if there's a new version of the bot and see what's changed",
  category: "Owner",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m } = context;
    const repo = "Fortunatusmokaya/dreaded-v2";
    const botPath = require('path').join(__dirname, '..');

    try {
      const localCommit = require('child_process').execSync('git rev-parse HEAD', { cwd: botPath }).toString().trim();
      const latestCommitRes = await require('axios').get(`https://api.github.com/repos/${repo}/commits/main`);
      const latestCommit = latestCommitRes.data.sha;

      if (localCommit === latestCommit) {
        await m.reply(
          `✅ No updates yet.\nYou're already using the **latest version** of DREADED-V2.\n\nIf you notice any error, contact the owner ASAP!`
        );
      } else {
        const compareRes = await require('axios').get(`https://api.github.com/repos/${repo}/compare/${localCommit}...main`);
        const filesChanged = compareRes.data.files.map(f => `• ${f.filename}`).join('\n');
        const commits = compareRes.data.commits.map(c => `- ${c.commit.message}`).join('\n');

        await m.reply(
          `🔄 *Update available!*\nUse the *update* command to apply changes.\n\n📝 *Recent changes:*\n${commits}\n\n📂 *Files changed:*\n${filesChanged}`
        );
      }
    } catch (err) {
      await m.reply(
        `❗ Could not check for updates.\nCheck internet or GitHub status.\nIf the issue persists, contact the owner.`
      );
    }
  });
});


dreaded({
  pattern: "kill2",
  desc: "Remotely terminate a group using its invite link",
  category: "Owner",
  filename: __filename
}, async (context) => {

  await ownerMiddleware(context, async () => {
    const { client, m, text, args } = context;

    if (!text) {
      return m.reply("Provide me a group link. Ensure bot is in that group with admin privileges!");
    }

    let id, subject;

    try {
      const inviteCode = args[0].split('https://chat.whatsapp.com/')[1];
      const info = await client.groupGetInviteInfo(inviteCode);
      ({ id, subject } = info);
    } catch (error) {
      return m.reply("I'm failing to get the metadata of the given group. Provide a valid group link.");
    }

    try {
      const groupMetadata = await client.groupMetadata(id);
      const participants = groupMetadata.participants;

      const botJid = client.decodeJid(client.user.id);
      const mokaya = participants
        .filter(v => v.pn !== botJid)
        .map(v => v.pn);

      await m.reply(`🟩 Initializing and preparing to kill the group *${subject}*`);

      try {
        await client.removeProfilePicture(id);
      } catch (e) {
        console.warn("Failed to remove profile picture:", e.message);
      }

      await client.groupUpdateSubject(id, "Terminated [ dreaded ]");
      await client.groupUpdateDescription(id, "Terminated\n\nDoesn't Make Sense\n\n[ dreaded ]");
      await client.groupRevokeInvite(id);
      await client.groupSettingUpdate(id, 'announcement');

      await client.sendMessage(
        id,
        {
          text: `At this time, my owner has initiated the kill command remotely. This has triggered me to remove all ${mokaya.length} group participants in the next second.\n\nGoodbye! 👋\n\nTHIS PROCESS CANNOT BE TERMINATED!`,
          mentions: mokaya
        },
        { quoted: m }
      );

      await client.groupParticipantsUpdate(id, mokaya, 'remove');

      await client.sendMessage(
        id,
        { text: `Goodbye Owner Group 👋\n\nIt's too cold in here! 🥶` }
      );

      await client.groupLeave(id);

      await m.reply("✅ Successfully Killed! 🎭");

    } catch (error) {
      console.error("Kill failed:", error);
      m.reply("Kill command failed. Bot is either not in that group or lacks admin privileges.");
    }

  });

});


dreaded({
  pattern: "kill",
  desc: "Terminate the group completely",
  category: "Owner",
  filename: __filename
}, async (context) => {

  await ownerMiddleware(context, async () => {
    const { client, m, isBotAdmin, participants } = context;

    if (!m.isGroup) return m.reply("This command is meant for groups.");
    if (!isBotAdmin) return m.reply("I need admin privileges.");

    const botJid = client.decodeJid(client.user.id);
    const mokaya = participants.filter(v => v !== botJid);

    await m.reply("Bot is initializing and preparing to terminate the group...");

    try {
      await client.removeProfilePicture(m.chat);
    } catch (err) {
      console.warn("Failed to remove profile picture:", err.message);
    }

    await client.groupUpdateSubject(m.chat, "Terminated [ dreaded ]");
    await client.groupUpdateDescription(m.chat, "Terminated\n\nDoesn't Make Sense\n\n[ dreaded ]");
    await client.groupRevokeInvite(m.chat);
    await client.groupSettingUpdate(m.chat, 'announcement');

    await client.sendMessage(
      m.chat,
      {
        text: `Kill command has been initialized and confirmed. Dreaded will now remove all ${mokaya.length} group participants in the next second.\n\nGoodbye! 👋\n\nTHIS PROCESS CANNOT BE TERMINATED AT THIS POINT!`,
        mentions: mokaya
      },
      { quoted: m }
    );

    await client.groupParticipantsUpdate(m.chat, mokaya, 'remove');

    await client.sendMessage(m.chat, { text: `Goodbye Owner Group 👋` });

    await client.groupLeave(m.chat);
  });
});

dreaded({
  pattern: "update",
  desc: "Restart the bot to apply latest code updates",
  category: "Owner",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m } = context;
    const repo = "Fortunatusmokaya/dreaded-v2";
    const botPath = path.join(__dirname, '..'); 

    try {
      const localCommit = execSync('git rev-parse HEAD', { cwd: botPath }).toString().trim();

      const res = await axios.get(`https://api.github.com/repos/${repo}/commits/main`);
      const latestCommit = res.data.sha;

      if (localCommit === latestCommit) {
        await m.reply("✅ You're already running the latest version of DREADED-V2.");
      } else {
        await m.reply("♻️ New version available! Restarting to apply update...");
        
setTimeout(() => process.exit(0), 2000);
      }
    } catch (err) {
      console.error("❗ Update check failed:", err.message);
      await m.reply("❗ Could not check for update. Restarting anyways...");
setTimeout(() => process.exit(0), 2000);
      

    }
  });
});

dreaded({
  pattern: "restart",
  desc: "Restart the bot manually",
  category: "Owner",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m } = context;
    await m.reply("🔄 Restarting bot...");
    setTimeout(() => process.exit(0), 2000); 
  });
});

dreaded({
  pattern: "block",
  desc: "Block command",
  category: "Owner",
  filename: __filename
}, async (context) => {
   
 
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner } = context;
  
          if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
              return m.reply("Tag or mention a user to unblock");
          }
          let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  
          const parts = users.split('@')[0];
  
          await client.updateBlockStatus(users, 'block'); 
          m.reply(`${parts} is blocked, eh?`); 
      });
});


dreaded({
  pattern: "botgc",
  desc: "Botgc command",
alias: ["groups"],
  category: "Owner",
  filename: __filename
}, async (context) => {
  
  
  
    await ownerMiddleware(context, async () => {
      const { client, m, text, Owner } = context;
  
    try {
  
        let getGroupzs = await client.groupFetchAllParticipating();
        let groupzs = Object.entries(getGroupzs)
            .slice(0)
            .map((entry) => entry[1]);
        let anaa = groupzs.map((v) => v.id);
        let jackhuh = `Bot groups:-\n\n`
        await m.reply(`Bot is in ${anaa.length} groups, fetching and sending their jids!`)
        const promises = anaa.map((i) => {
          return new Promise((resolve) => {
            client.groupMetadata(i).then((metadat) => {
              setTimeout(() => {
                jackhuh += `Subject:- ${metadat.subject}\n`
                jackhuh += `Members: ${metadat.participants.length}\n`
                jackhuh += `Jid:- ${i}\n\n`
                resolve()
              }, 500);
            })
          })
        })
        await Promise.all(promises)
        m.reply(jackhuh);
  
    } catch (e) {
      m.reply("Error occured while accessing bot groups.\n\n" + e)
    }
  
    });
});


dreaded({
  pattern: "broadcast",
  desc: "Broadcast command",
alias: ["bc"],
  category: "Owner",
  filename: __filename
}, async (context) => {
  
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, participants, pushname } = context;
  
  if (!text) return m.reply("Provide a broadcast message!");
  if (!m.isGroup) return m.reply("This command is meant for groups");
  
  let getGroups = await client.groupFetchAllParticipating() 
           let groups = Object.entries(getGroups) 
               .slice(0) 
               .map(entry => entry[1]) 
           let res = groups.map(v => v.id) 
  
  await m.reply("sending broadcast message...")
  
  for (let i of res) { 
  
  
  let txt = `BROADCAST MESSAGE (dreaded) \n\n🀄 Message: ${text}\n\nWritten by: ${pushname}` 
  
  await client.sendMessage(i, { 
                   image: { 
                       url: "https://telegra.ph/file/c75efecf7f0aef851fc02.jpg" 
                   }, mentions: participants.map(a => a.id),
                   caption: `${txt}` 
               }) 
           } 
  await m.reply("Message sent across all groups");
  })
});


dreaded({
  pattern: "eval",
  desc: "Eval command",
alias: ["evaluate"],
  category: "Owner",
  filename: __filename
}, async (context) => {
  
  
      await ownerMiddleware(context, async () => {
  
  
    const { 
      client, m, text, Owner, chatUpdate, store, isBotAdmin, isAdmin, IsGroup, 
      participants, pushname, body, budy, totalCommands, args, mime, qmsg, msgDreaded, 
      botNumber, itsMe, packname, author, generateProfilePicture, groupMetadata, 
      dreadedspeed, mycode, fetchJson, exec, getRandom, UploadFileUgu, TelegraPh, 
      prefix, cmd, botname, mode, gcpresence, antitag, antidelete, antionce, 
      fetchBuffer, uploadtoimgur, groupSender, ytmp3, getGroupAdmins, Tag
    } = context;
  
    
    
  
    try {
      const trimmedText = text.trim();
  
      if (!trimmedText) {
        return m.reply("No command provided for eval!");
      }
  
     
      let evaled = await eval(trimmedText);
  
      
      if (typeof evaled !== 'string') {
        evaled = require('util').inspect(evaled);
      }
  
      await m.reply(evaled);
  
    } catch (err) {
      await m.reply("Error during eval execution:\n" + String(err));
    }
})
});



dreaded({
  pattern: "fullpp",
  desc: "Fullpp command",
alias: ["pp", "botpp"],
  category: "Owner",
  filename: __filename
}, async (context) => {
   
  
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner, generateProfilePicture, botNumber, mime } = context;
  
  try {
  
  
    const quotedImage = m.msg?.contextInfo?.quotedMessage.imageMessage;
    if (!quotedImage) {
      m.reply('Quote an image...');
      return;
    }
  
  
  
  var medis = await client.downloadAndSaveMediaMessage(quotedImage);
  
  
  
                      var {
                          img
                      } = await generateProfilePicture(medis)
  
  
  
  
  
  
  client.query({
                  tag: 'iq',
                  attrs: {
                      target: undefined,
                      to: S_WHATSAPP_NET,
                      type:'set',
                      xmlns: 'w:profile:picture'
                  },
                  content: [
                      {
                          tag: 'picture',
                          attrs: { type: 'image' },
                          content: img
                      }
                  ]
              })
                      
                      fs.unlinkSync(medis)
                      m.reply("Bot Profile Picture Updated")
  
  } catch (error) {
  
  m.reply("An error occured while updating bot profile photo\n" + error)
  
  }
  
                  })
});




dreaded({
  pattern: "getcmd",
  desc: "Fetch code of any command",
  category: "Owner",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, text, prefix } = context;

    if (!text) {
      return m.reply(`Provide the name of the command.\nFor example:\n${prefix}getcmd block`);
    }

    const cmdsDir = path.join(__dirname); 
    const files = fs.readdirSync(cmdsDir).filter(f => f.endsWith('.js'));

    let found = false;

    for (const file of files) {
      const content = fs.readFileSync(path.join(cmdsDir, file), 'utf-8');

     
      const regex = new RegExp(`dreaded\\s*\\(\\s*{[^}]*pattern\\s*:\\s*["'\`]${text}["'\`]`, 'i');

      if (regex.test(content)) {
      
        const startIndex = content.search(regex);
        const snippet = content.slice(startIndex);

        
        const nextDreaded = snippet.indexOf('dreaded(', 1);
        const endIndex = nextDreaded !== -1 ? startIndex + nextDreaded : content.length;
        const commandCode = content.slice(startIndex, endIndex).trim();

        await m.reply(`// From ${file}\n\n${commandCode}`);
        found = true;
        break;
      }
    }

    if (!found) {
      m.reply(`❌ Command *${text}* not found in Cmds/`);
    }
  });
});

dreaded({
  pattern: "joingc",
  desc: "Joingc command",
alias: ["join"],
  category: "Owner",
  filename: __filename
}, async (context) => {
   
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner, args } = context;
  
                   if (!text) return m.reply("provide a valid group link")
  let result = args[0].split('https://chat.whatsapp.com/')[1]
  
  try {
      const info = await client.groupGetInviteInfo(result);
      let { subject } = info;
  } catch (error) {
      console.log("error")
  }
       
      await client.groupAcceptInvite(result)
          .then(() => m.reply(`Bot has joined ${subject}`))
          .catch((res) => {
              if (res.data == 400) return m.reply('Group does not exist.');
              if (res.data == 401) return m.reply('Bot was previously removed, cannot join using link.');
              if (res.data == 409) return m.reply('Bot was already in the group, Uh?');
              if (res.data == 410) return m.reply('This group link is reset, provide a new one');
              if (res.data == 500) return m.reply('This group is full');
          });
              
  
               });
});


 


dreaded({
  pattern: "leavegc",
  desc: "Leavegc command",
alias: ["leave", "left"],
  category: "Owner",
  filename: __filename
}, async (context) => {
   
  
      await ownerMiddleware(context, async () => {
          const { client, m, Owner, participants } = context;
  
  
  if (!m.isGroup) return m.reply("This command is meant for groups");
  
  await client.sendMessage(m.chat, { text : 'Goodbye 👋, Dreaded will now exit the group...' , mentions: participants.map(a => a.id)}, { quoted: m });
  await client.groupLeave(m.chat); 
  
  })
});


dreaded({
  pattern: "oadmin",
  desc: "Oadmin command",
  category: "Owner",
  filename: __filename
}, async (context) => {
   
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, Owner, isBotAdmin } = context;
  
                   if (!m.isGroup) return m.reply("This command is meant for groups.");
           if (!isBotAdmin) return m.reply("I need admin privileges"); 
  
                   await client.groupParticipantsUpdate(m.chat,  [m.sender], 'promote'); 
   m.reply('Promoted< 🥇 >'); 
            })
});





dreaded({
  pattern: "save",
  desc: "Save command",
  category: "Owner",
  filename: __filename
}, async (context) => {
  /*   Fortunatus :v
  
  What's The Point Of This Code ? */
  
   
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, Owner } = context;
  
  })
});


dreaded({
  pattern: "shell",
  desc: "Shell command",
  category: "Owner",
  filename: __filename
}, async (context) => {
  
  
      
  
  
  await ownerMiddleware(context, async () => {
  
    
      const { client, m, text, budy, Owner } = context;
  
      try {
        
  
        
        if (!text) {
          return m.reply("No command provided. Please provide a valid shell command.");
        }
  
        
  
      
        exec(text, (err, stdout, stderr) => {
          if (err) {
            return m.reply(`Error: ${err.message}`);
          }
          if (stderr) {
            return m.reply(`stderr: ${stderr}`);
          }
          if (stdout) {
            return m.reply(stdout);
          }
        });
  
      } catch (error) {
        await m.reply("An error occurred while running the shell command\n" + error);
      }
                    })
});


dreaded({
  pattern: "tag",
  desc: "Tag command",
  category: "Owner",
  filename: __filename
}, async (context) => {
   
  
  
      await ownerMiddleware(context, async () => {
  
  
          const { client, m, args, participants, text } = context;
  
  
  if (!m.isGroup) return m.reply('Command meant for groups');
  
  
  
  client.sendMessage(m.chat, { text : text ? text : 'Attention Here' , mentions: participants.map(a => a.id)}, { quoted: m });
  
  });
});


dreaded({
  pattern: "unblock",
  desc: "Unblock command",
  category: "Owner",
  filename: __filename
}, async (context) => {
  
  
  
      await ownerMiddleware(context, async () => {
          const { client, m, text, Owner } = context;
  
          if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
              return m.reply("Tag or mention a user to unblock");
          }
          let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  
          const parts = users.split('@')[0];
  
          await client.updateBlockStatus(users, 'unblock'); 
         await m.reply(`${parts} is unblocked, eh?`); 
      });
});
