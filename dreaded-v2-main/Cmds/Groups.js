const dreaded = global.dreaded;
const middleware = require('../utility/botUtil/middleware');
const { getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } = require('@whiskeysockets/baileys');
const fs = require("fs");
const path = require("path");

dreaded({
  pattern: "add",
  desc: "Add command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m, participants, botname, groupMetadata, text, pushname } = context;
  
          
  
          if (!text) return m.reply("provide number to be added in this format.\n\nadd 254114018035");
  
          const _participants = participants.map((user) => user.id);
  
          const users = (await Promise.all(
              text.split(',')
                  .map((v) => v.replace(/[^0-9]/g, ''))
                  .filter((v) => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
                  .map(async (v) => [
                      v,
                      await client.onWhatsApp(v + '@s.whatsapp.net'),
                  ]),
          )).filter((v) => v[1][0]?.exists).map((v) => v[0] + '@c.us');
  
          const response = await client.query({
              tag: 'iq',
              attrs: {
                  type: 'set',
                  xmlns: 'w:g2',
                  to: m.chat,
              },
              content: users.map((jid) => ({
                  tag: 'add',
                  attrs: {},
                  content: [{ tag: 'participant', attrs: { jid } }],
              })),
          });
  
          
  
          
  
          const add = getBinaryNodeChild(response, 'add');
          const participant = getBinaryNodeChildren(add, 'participant');
  
          let respon = await client.groupInviteCode(m.chat);
  
          
  
  for (const user of participant.filter((item) => item.attrs.error === 401 || item.attrs.error === 403 || item.attrs.error === 408)) {
      const jid = user.attrs.jid;
      const content = getBinaryNodeChild(user, 'add_request');
      const invite_code = content.attrs.code;
      const invite_code_exp = content.attrs.expiration;
  
      let teza;
      if (user.attrs.error === 401) {
          teza = `@${jid.split('@')[0]} has blocked the bot.`;
      } else if (user.attrs.error === 403) {
          teza = `@${jid.split('@')[0]} has set privacy settings for group adding.`;
      } else if (user.attrs.error === 408) {
          teza = `@${jid.split('@')[0]} recently left the group.`;
      } 
  
      await m.reply(teza);
  
      let links = `${pushname} is trying to add or request you to join the group ${groupMetadata.subject}:\n\nhttps://chat.whatsapp.com/${respon}\n\n${botname} 🤖`;
  
      await client.sendMessage(jid, { text: links }, { quoted: m });
  }
      });
});


dreaded({
  pattern: "approve-all",
  desc: "Approve-all command",
alias: ["approveall"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
      const { client, m, chatUpdate, store, isBotAdmin, isAdmin } = context;
  
  if (!m.isGroup) return m.reply("This command is meant for groups");
  if (!isAdmin) return m.reply("You need admin privileges");
  if (!isBotAdmin) return m.reply("I need admin privileges");
  
  const responseList = await client.groupRequestParticipantsList(m.chat);
  
  if (responseList.length === 0) return m.reply("there are no pending join requests at this time.");
  
  for (const participan of responseList) {
      const response = await client.groupRequestParticipantsUpdate(
          m.chat, 
          [participan.jid], // Approve/reject each participant individually
          "approve" // or "reject"
      );
      console.log(response);
  }
  m.reply("all pending participants have been approved to join.");
});


dreaded({
  pattern: "close",
  desc: "Close command",
alias: ["closegc"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m } = context;
  
          await client.groupSettingUpdate(m.chat, 'announcement');
          m.reply('Group closed.');
      });
});




dreaded({
  pattern: "delete",
  desc: "Delete command",
  category: "Groups",
  filename: __filename
}, async (context) => {

  
  await middleware(context, async () => {
    const { client, m } = context;

    if (!m.quoted) return m.reply(`Did you quote a message ?`);

    client.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    });
  });
});


dreaded({
  pattern: "demote",
  desc: "Demote command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  await middleware(context, async () => {
    const { client, m, args } = context;

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
      return m.reply("You did not give me a user!?");
    }

    let targetJid;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.quoted.sender);
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.mentionedJid[0]);
    } else if (args[0]) {
      targetJid = args[0].includes('@s.whatsapp.net') ? args[0] : `${args[0]}@s.whatsapp.net`;
    }

    if (!targetJid) return m.reply("Invalid user.");

    if (targetJid === "254114018035@s.whatsapp.net") {
      return m.reply("It's Owner Number! 🦄");
    }

    await client.groupParticipantsUpdate(m.chat, [targetJid], 'demote');

    const parts = targetJid.split('@')[0];
    m.reply(`${parts} is no longer an admin. 🎗️`);
  });
});

dreaded({
  pattern: "gcpp",
  desc: "Fullpp command",
alias: ["icon", "ppgc"],
  category: "Owner",
  filename: __filename
}, async (context) => {




      await middleware(context, async () => {
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
                      target: m.chat,
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
                      m.reply("Group icon updated. ")

  } catch (error) {

  m.reply("An error occured while updating group icon photo\n" + error)

  }

                  })
});


dreaded({
  pattern: "hidetag",
  desc: "Hidetag command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m, args, participants, text } = context;
  
          await client.sendMessage(
              m.chat,
              { 
                  text: text ? text : '☞︎︎︎ TAGGED ☜︎︎︎', 
                  mentions: participants 
              },
              { quoted: m }
          );
      });
});


dreaded({
  pattern: "link",
  desc: "Link command",
alias: ["linkgc", "gclink"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m } = context;
  
                   let response = await client.groupInviteCode(m.chat); 
                   client.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\nGroup link!`, m, { detectLink: true }); 
  
  });
});


dreaded({
  pattern: "open",
  desc: "Open command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m } = context;
  
          await client.groupSettingUpdate(m.chat, 'not_announcement');
          m.reply('Group opened.');
      });
});


dreaded({
  pattern: "promote",
  desc: "promote command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  await middleware(context, async () => {
    const { client, m, args } = context;

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
      return m.reply("You did not give me a user!?");
    }

    let targetJid;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.quoted.sender);
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.mentionedJid[0]);
    } else if (args[0]) {
      targetJid = args[0].includes('@s.whatsapp.net') ? args[0] : `${args[0]}@s.whatsapp.net`;
    }

    if (!targetJid) return m.reply("Invalid user.");

    

    await client.groupParticipantsUpdate(m.chat, [targetJid], 'promote');

    const parts = targetJid.split('@')[0];
    m.reply(`${parts} is now an admin 🥇`);
  });
});

dreaded({
  pattern: "reject-all",
  desc: "Reject-all command",
alias: ["rejectall"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m } = context;
  
  const responseList = await client.groupRequestParticipantsList(m.chat);
  
  if (responseList.length === 0) return m.reply("there are no pending join requests.");
  
  for (const participan of responseList) {
      const response = await client.groupRequestParticipantsUpdate(
          m.chat, 
          [participan.jid], // Approve/reject each participant individually
          "reject" // or "reject"
      );
      console.log(response);
  }
  m.reply("all pending join requests have been rejected.");
  
  });
});


dreaded({
  pattern: "remove",
  desc: "Remove command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  await middleware(context, async () => {
    const { client, m, args } = context;

    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0) && !args[0]) {
      return m.reply("You did not give me a user!?");
    }

    let targetJid;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.quoted.sender);
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      targetJid = groupContext.getJidFromLid(m.mentionedJid[0]);
    } else if (args[0]) {
      targetJid = args[0].includes('@s.whatsapp.net') ? args[0] : `${args[0]}@s.whatsapp.net`;
    }

    if (!targetJid) return m.reply("Invalid user.");

    if (targetJid === "254114018035@s.whatsapp.net") {
      return m.reply("It's Owner Number! 🦄");
    }

    await client.groupParticipantsUpdate(m.chat, [targetJid], 'remove');

    const parts = targetJid.split('@')[0];
    m.reply(`${parts} has been removed...`);
  });
});


dreaded({
  pattern: "requests",
  desc: "Requests command",
alias: ["req"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m } = context;
  
  
  const response = await client.groupRequestParticipantsList(m.chat);
  
  if (response.length === 0) return m.reply("There are no pending join requests.");
  
  let jids = ''; 
  
  response.forEach((participant, index) => {
      jids +='+' + participant.jid.split('@')[0];
      if (index < response.length - 1) {
          jids += '\n'; 
      }
  });
  
   client.sendMessage(m.chat, {text:`Pending Participants:- 🕓\n${jids}\n\nUse the command .approve-all or .reject-all to approve or reject these join requests.`}, {quoted:m}); 
  
  
  })
});


dreaded({
  pattern: "revoke",
  desc: "Revoke command",
alias: ["reset"],
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m, groupMetadata } = context;
  
  await client.groupRevokeInvite(m.chat); 
     await client.sendText(m.chat, 'Group link revoked!', m); 
     let response = await client.groupInviteCode(m.chat); 
   client.sendText(m.sender, `https://chat.whatsapp.com/${response}\n\nHere is the new group link for ${groupMetadata.subject}`, m, { detectLink: true }); 
   client.sendText(m.chat, `Sent you the new group link in private!`, m); 
  
  })
});


dreaded({
  pattern: "tagall",
  desc: "Tagall command",
  category: "Groups",
  filename: __filename
}, async (context) => {
  
  
  
      await middleware(context, async () => {
          const { client, m, args, participants, text } = context;
  
          let txt = `Tagged by ${m.pushName}.\n\nMessage:- ${text ? text : 'No Message!'}\n\n`; 
          
          for (let mem of participants) { 
              txt += `📧 @${mem.split('@')[0]}\n`; 
          } 
  
          await client.sendMessage(m.chat, {
              text: txt,
              mentions: participants
          }, { quoted: m });
      });
});
