const dreaded = global.dreaded;
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { database } = require('../Env/settings');

const {
  getSettings,
  updateSetting,
  getGroupSetting,
  updateGroupSetting,
  getSudoUsers,
  addSudoUser,
  removeSudoUser,
  getBannedUsers,
  banUser,
  unbanUser
} = require('../Database/adapter');



dreaded({
  pattern: "addsudo",
  desc: "Addsudo command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { args, m, client } = context;

    let numberToAdd;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.quoted.sender);
      numberToAdd = jid.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.mentionedJid[0]);
      numberToAdd = jid.split('@')[0];
    } else {
      numberToAdd = args[0];
      if (numberToAdd && numberToAdd.includes('@')) {
        numberToAdd = numberToAdd.split('@')[0];
      }
    }

    if (!numberToAdd || !/^\d+$/.test(numberToAdd)) {
      return await m.reply('❌ Please provide a valid number or quote a user.');
    }

    const sudoUsers = await getSudoUsers();
    if (sudoUsers.includes(numberToAdd)) {
      return await m.reply('⚠️ This number is already a sudo user.');
    }

    await addSudoUser(numberToAdd);
    await m.reply(`✅ ${numberToAdd} is now a Sudo User!`);
  });
});

dreaded({
  pattern: "anticall",
  desc: "Anticall command",
  category: "Settings",
  filename: __filename
}, async (context) => {
      await ownerMiddleware(context, async () => {
const { args, m } = context;
          
          const value = args[0]?.toLowerCase();
  
          let settings = await getSettings();
          const prefix = settings.prefix;
          let isEnabled = settings.anticall === true;
  
          if (value === 'on' || value === 'off') {
              const action = value === 'on';
  
              if (isEnabled === action) {
                  return await m.reply(`✅ Anti-call is already ${value.toUpperCase()}.`);
              }
  
              await updateSetting('anticall', action ? true : false);
              await m.reply(`✅ Anti-call has been turned ${value.toUpperCase()}.`);
          } else {
              await m.reply(
                  `📄 Current Anti-call setting: ${isEnabled ? 'ON' : 'OFF'}\n\n` +
                  `_Use "${prefix}anticall on" or "${prefix}anticall off" to change it._`
              );
          }
      });
});


dreaded({
  pattern: "antidelete",
  desc: "Antidelete command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  

      await ownerMiddleware(context, async () => {
const { args, m } = context;
     
          const value = args[0]?.toLowerCase();
          const jid = m.chat;
  
          if (!jid.endsWith('@g.us')) {
              return await m.reply('❌ This command can only be used in groups.');
          }
  
          const settings = await getSettings();
          const prefix = settings.prefix;
  
          let groupSettings = await getGroupSetting(jid);
          let isEnabled = groupSettings?.antidelete === true;  
  
          if (value === 'on' || value === 'off') {
              const action = value === 'on';
  
              if (isEnabled === action) {
                  return await m.reply(`✅ Antidelete is already ${value.toUpperCase()}.`);
              }
  
              await updateGroupSetting(jid, 'antidelete', action ? 'true' : 'false');
              await m.reply(`✅ Antidelete has been turned ${value.toUpperCase()} for this group. Deleted messages will be forwarded to your inbox.`);
          } else {
              await m.reply(`📄 Current Antidelete setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n _Use ${prefix}antidelete on or ${prefix}antidelete off to change it._`);
          }
      });
});


dreaded({
  pattern: "adminevents",
  desc: "Admin events command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  
  
  
      await ownerMiddleware(context, async () => {
         const { args, m } = context;
          const value = args[0]?.toLowerCase();
          const jid = m.chat;
  
          if (!jid.endsWith('@g.us')) {
              return await m.reply('❌ This command can only be used in groups.');
          }
  
          const settings = await getSettings();
          const prefix = settings.prefix;
  
          let groupSettings = await getGroupSetting(jid);
          let isEnabled = groupSettings?. adminevents === true;  
  
          if (value === 'on' || value === 'off') {
              const action = value === 'on';
  
              if (isEnabled === action) {
                  return await m.reply(`✅ Admin events is already ${value.toUpperCase()}.`);
              }
  
              await updateGroupSetting(jid, 'adminevents', action ? 'true' : 'false');
              await m.reply(`✅ Admin events has been turned ${value.toUpperCase()} for this group. Bot will notify when demotions/promotions are done...`);
          } else {
              await m.reply(`📄 Current Admin events setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n _Use ${prefix}adminevents on or ${prefix}adminevents off to change it._`);
          }
      });
});


dreaded({
  pattern: "antiforeign",
  desc: "Antiforeign command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  
  
      await ownerMiddleware(context, async () => {
const { args, m } = context;
          
          const value = args[0]?.toLowerCase();
          const jid = m.chat;
  
          if (!jid.endsWith('@g.us')) {
              return await m.reply('❌ This command can only be used in groups.');
          }
  
          const settings = await getSettings();
          const prefix = settings.prefix;
  
          let groupSettings = await getGroupSetting(jid);
          let isEnabled = groupSettings?.antiforeign === true;
  
          const Myself = await client.decodeJid(client.user.id);
          const groupMetadata = await client.groupMetadata(m.chat);
          const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
          const isBotAdmin = userAdmins.includes(Myself);
  
          if (value === 'on' && !isBotAdmin) {
              return await m.reply('❌ I need admin privileges to enable Antiforeign.');
          }
  
          if (value === 'on' || value === 'off') {
              const action = value === 'on';
  
              if (isEnabled === action) {
                  return await m.reply(`✅ Antiforeign is already ${value.toUpperCase()}.`);
              }
  
              await updateGroupSetting(jid, 'antiforeign', action);
              await m.reply(`✅ Antiforeign has been turned ${value.toUpperCase()} for this group.`);
          } else {
              await m.reply(
                  `📄 Current Antiforeign setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n` +
                  `_Use ${prefix}antiforeign on or ${prefix}antiforeign off to change it._`
              );
          }
      });
});


dreaded({
  pattern: "antilink",
  desc: "Antilink command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  
  
  
      await ownerMiddleware(context, async () => {
const { args, m, client, isAdmin, isBotAdmin } = context;
       
          const value = args[0]?.toLowerCase();
          const jid = m.chat;
  
          if (!jid.endsWith('@g.us')) {
              return await m.reply('❌ This command can only be used in groups.');
          }
  
          const settings = await getSettings();
          const prefix = settings.prefix;
  
          let groupSettings = await getGroupSetting(jid);
          let isEnabled = groupSettings?.antilink === true;
  
          
  
          if (value === 'on' && !isBotAdmin) {
              return await m.reply('❌ I need admin privileges to enable Antilink.');
          }
  
          if (value === 'on' || value === 'off') {
              const action = value === 'on';
  
              if (isEnabled === action) {
                  return await m.reply(`✅ Antilink is already ${value.toUpperCase()}.`);
              }
  
              await updateGroupSetting(jid, 'antilink', action ? 'true' : 'false');
              await m.reply(`✅ Antilink has been turned ${value.toUpperCase()} for this group.`);
          } else {
              await m.reply(`📄 Current Antilink setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n _Use ${prefix}antilink on or ${prefix}antilink off to change it._`);
          }
      });
});







dreaded({
  pattern: "autolike",
  alias: [],
  desc: "Autolike command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    const value = args[0]?.toLowerCase();
    const settings = await getSettings();
    const prefix = settings.prefix;

    if (value === 'on') {
      if (settings.autolike) return m.reply('✅ Autolike is already ON.');
      await updateSetting('autolike', 'true');
      await m.reply('✅ Autolike has been turned ON. The bot will now like status updates.');
    } else if (value === 'off') {
      if (!settings.autolike) return m.reply('❌ Autolike is already OFF.');
      await updateSetting('autolike', 'false');
      await m.reply('❌ Autolike has been turned OFF.');
    } else {
      await m.reply(`📄 Current autolike setting: ${settings.autolike ? 'ON' : 'OFF'}\n\nUse _${prefix}autolike on_ or _${prefix}autolike off_.`);
    }
  });
});


dreaded({
  pattern: "autoread",
  alias: [],
  desc: "Autoread command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    const value = args[0]?.toLowerCase();
    const settings = await getSettings();

    if (value === 'on') {
      if (settings.autoread) return m.reply('✅ Autoread is already ON.');
      await updateSetting('autoread', 'true');
      await m.reply('✅ Autoread has been turned ON. The bot will now automatically read messages.');
    } else if (value === 'off') {
      if (!settings.autoread) return m.reply('❌ Autoread is already OFF.');
      await updateSetting('autoread', 'false');
      await m.reply('❌ Autoread has been turned OFF.');
    } else {
      await m.reply(`📄 Current autoread setting: ${settings.autoread ? 'ON' : 'OFF'}\n\nUse _${settings.prefix}autoread on_ or _${settings.prefix}autoread off_.`);
    }
  });
});


dreaded({
  pattern: "autoview",
  alias: [],
  desc: "Autoview command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    const value = args[0]?.toLowerCase();
    const settings = await getSettings();

    if (value === 'on') {
      if (settings.autoview) return m.reply('✅ Autoview is already ON.');
      await updateSetting('autoview', 'true');
      await m.reply('✅ Autoview has been turned ON. The bot will now automatically view status updates.');
    } else if (value === 'off') {
      if (!settings.autoview) return m.reply('❌ Autoview is already OFF.');
      await updateSetting('autoview', 'false');
      await m.reply('❌ Autoview has been turned OFF.');
    } else {
      await m.reply(`📄 Current autoview setting: ${settings.autoview ? 'ON' : 'OFF'}\n\nUse _${settings.prefix}autoview on_ or _${settings.prefix}autoview off_.`);
    }
  });
});


dreaded({
  pattern: "ban",
  alias: [],
  desc: "Ban command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { args, m, client } = context;

    const settings = await getSettings();
    if (!settings) return m.reply('❌ Settings not found.');

    const sudoUsers = await getSudoUsers();
    let numberToBan;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.quoted.sender);
      numberToBan = jid.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.mentionedJid[0]);
      numberToBan = jid.split('@')[0];
    } else {
      numberToBan = args[0];
      if (numberToBan && numberToBan.includes('@')) {
        numberToBan = numberToBan.split('@')[0];
      }
    }

    if (!numberToBan || !/^\d+$/.test(numberToBan)) {
      return await m.reply('❌ Please provide a valid number or quote a user.');
    }

    if (sudoUsers.includes(numberToBan)) {
      return m.reply('❌ You cannot ban a Sudo User.');
    }

    const bannedUsers = await getBannedUsers();
    if (bannedUsers.includes(numberToBan)) {
      return m.reply('⚠️ This user is already banned.');
    }

    await banUser(numberToBan);
    await m.reply(`✅ ${numberToBan} has been banned.`);
  });
});


dreaded({
  pattern: "banlist",
  alias: [],
  desc: "Banlist command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    

    const bannedUsers = await getBannedUsers();
    if (!bannedUsers || bannedUsers.length === 0) {
      return await m.reply('✅ There are no banned users at the moment.');
    }

    const list = bannedUsers.map((num, index) => `${index + 1}. ${num}`).join('\n');
    await m.reply(`❌ *Banned Users:*\n\n${list}`);
  });
});


dreaded({
  pattern: "checksudo",
  alias: [],
  desc: "Checksudo command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  const { args, m } = context;

  const sudoUsers = await getSudoUsers();
  if (!sudoUsers || sudoUsers.length === 0) {
    return await m.reply('⚠️ No Sudo Users found.');
  }

  await m.reply(`📄 Current Sudo Users:\n\n${sudoUsers.map((jid) => `- ${jid}`).join('\n')}`);
});


dreaded({
  pattern: "delsudo",
  alias: [],
  desc: "Delsudo command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m, client } = context;
    

    let numberToRemove;

    

if (m.quoted) {
  const groupContext = await client.getGroupContext(m, client.user.id);
  const jid = groupContext.getJidFromLid(m.quoted.sender);
  numberToRemove = jid.split('@')[0];
} else if (m.mentionedJid && m.mentionedJid.length > 0) {
  const groupContext = await client.getGroupContext(m, client.user.id);
  const jid = groupContext.getJidFromLid(m.mentionedJid[0]);
  numberToRemove = jid.split('@')[0];
} else {
  numberToRemove = args[0];
}
    if (!numberToRemove || !/^\d+$/.test(numberToRemove)) {
      return await m.reply('❌ Please provide a valid number or quote a user.');
    }


    const settings = await getSettings();
    if (!settings) {
      return await m.reply('❌ Settings not found.');
    }

    const sudoUsers = await getSudoUsers();
    if (!sudoUsers.includes(numberToRemove)) {
      return await m.reply('⚠️ This number is not a sudo user.');
    }

    await removeSudoUser(numberToRemove);
    await m.reply(`✅ ${numberToRemove} has been removed from Sudo Users.`);
  });
});


dreaded({
  pattern: "events",
  alias: [],
  desc: "Events command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply('❌ This command can only be used in groups.');
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.events === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(`✅ Events are already ${value.toUpperCase()} for this group.`);
      }

      await updateGroupSetting(jid, 'events', action ? 'true' : 'false');
      await m.reply(`✅ Events have been turned ${value.toUpperCase()} for this group.`);
    } else {
      await m.reply(`📄 Current events setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n_Use ${prefix}events on_ or _${prefix}events off_ to change it.`);
    }
  });
});

dreaded({
  pattern: "gcpresence",
  alias: [],
  desc: "Gcpresence command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply('❌ This command can only be used in groups.');
    }

    const settings = await getSettings();
    const prefix = settings.prefix;

    let groupSettings = await getGroupSetting(jid);
    let isEnabled = groupSettings?.gcpresence === true;

    if (value === 'on' || value === 'off') {
      const action = value === 'on';

      if (isEnabled === action) {
        return await m.reply(`✅ GCPresence is already ${value.toUpperCase()}.`);
      }

      await updateGroupSetting(jid, 'gcpresence', action ? 'true' : 'false');
      await m.reply(`✅ Typing/recording has been turned ${value.toUpperCase()} for this group.`);
    } else {
      await m.reply(`📄 Current GCPresence setting for this group: ${isEnabled ? 'ON' : 'OFF'}\n\n_Use ${prefix}gcpresence on_ or _${prefix}gcpresence off_ to change it.`);
    }
  });
});


dreaded({
  pattern: "gcsettings",
  alias: [],
  desc: "Gcsettings command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
  
    const jid = m.chat;
    console.log(`Received request for group: ${jid}`);

    if (!jid.endsWith('@g.us')) {
      console.log('The command was not issued in a group chat.');
      return await m.reply('❌ This command can only be used in groups.');
    }

    console.log(`Fetching group settings for group: ${jid}`);
    let groupSettings = await getGroupSetting(jid);

    if (!groupSettings) {
      console.log(`No settings found for group: ${jid}`);
      return await m.reply('❌ No group settings found.');
    }

    console.log(`Group settings for ${jid}: ${JSON.stringify(groupSettings)}`);

    let response = `*Group Settings for ${jid}*\n`;
    response += `🔘 *Antilink*: ${groupSettings.antilink ? '✅ ON' : '❌ OFF'}\n`;
    
    response += `🔘 *Events*: ${groupSettings.events ? '✅ ON' : '❌ OFF'}\n`;
    
    response += `🔘 *GCPresence*: ${groupSettings.gcpresence ? '✅ ON' : '❌ OFF'}\n`;
    response += `🔘 *Antiforeign*: ${groupSettings.antiforeign ? '✅ ON' : '❌ OFF'}\n`;
    response += `🔘 *Admin Events*: ${groupSettings.adminevents ? '✅ ON' : '❌ OFF'}\n`;

    await m.reply(response);
  });
});


dreaded({
  pattern: "mode",
  alias: [],
  desc: "Mode command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    
    const value = args[0]?.toLowerCase();

    const settings = await getSettings();
    const prefix = settings.prefix;

    if (value === 'public' || value === 'private') {
      if (settings.mode === value) {
        return await m.reply(`✅ Bot is already in ${value} mode.`);
      }
      await updateSetting('mode', value);
      await m.reply(`✅ Bot mode has been set to: ${value}`);
    } else {
      await m.reply(`📄 Current mode setting: ${settings.mode || 'undefined'}\n\nUse _${prefix}mode public_ or _${prefix}mode private_.`);
    }
  });
});


dreaded({
  pattern: "prefix",
  alias: [],
  desc: "Prefix command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    
    const newPrefix = args[0];

    const settings = await getSettings();

    if (newPrefix === 'null') {
      if (!settings.prefix) {
        return await m.reply(`✅ The bot was already prefixless.`);
      }
      await updateSetting('prefix', '');
      await m.reply(`✅ The bot is now prefixless.`);
    } else if (newPrefix) {
      if (settings.prefix === newPrefix) {
        return await m.reply(`✅ The prefix was already set to: ${newPrefix}`);
      }
      await updateSetting('prefix', newPrefix);
      await m.reply(`✅ Prefix has been updated to: ${newPrefix}`);
    } else {
      await m.reply(`📄 Current prefix: ${settings.prefix || 'No prefix set.'}\n\nUse _${settings.prefix || '.'}prefix null_ to remove the prefix or _${settings.prefix || '.'}prefix <any symbol>_ to set a specific prefix.`);
    }
  });
});


dreaded({
  pattern: "presence",
  alias: [],
  desc: "Presence command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    const value = args[0]?.toLowerCase();

    const settings = await getSettings();
    const prefix = settings.prefix;
    const valid = ['online', 'offline', 'recording', 'typing'];

    if (valid.includes(value)) {
      if (settings.presence === value) return m.reply(`✅ Presence already set to: ${value}`);
      await updateSetting('presence', value);
      return m.reply(`✅ Presence updated to: ${value}`);
    }

    return m.reply(`📄 Current: ${settings.presence || 'undefined'}\n\n_Use ${prefix}presence online/offline/recording/typing_`);
  });
});

dreaded({
  pattern: "reaction",
  alias: [],
  desc: "Reaction command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
    
    const newEmoji = args[0];

    const settings = await getSettings();
    const prefix = settings.prefix;
    const current = settings.reactEmoji || 'No emoji set';

    if (newEmoji) {
      if (newEmoji === 'random') {
        if (current === 'random') return m.reply('✅ Already set to random.');
        await updateSetting('reactEmoji', 'random');
        return m.reply('✅ Emoji set to random.');
      } else {
        if (current === newEmoji) return m.reply(`✅ Already set to: ${newEmoji}`);
        await updateSetting('reactEmoji', newEmoji);
        return m.reply(`✅ Emoji updated to: ${newEmoji}`);
      }
    }

    return m.reply(`📄 Current: ${current}\n\nUse _${prefix}reaction random_ or _${prefix}reaction 😎_`);
  });
});

dreaded({
  pattern: "stickerwm",
  alias: [],
  desc: "Stickerwm command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m } = context;
 
    const newWM = args.join(" ") || null;

    const settings = await getSettings();
    if (!settings) return m.reply('❌ Settings not found.');

    if (newWM !== null) {
      if (newWM === 'null') {
        if (!settings.packname) return m.reply(`✅ Already no watermark.`);
        await updateSetting('packname', '');
        return m.reply(`✅ Watermark removed.`);
      } else {
        if (settings.packname === newWM) return m.reply(`✅ Already set to: ${newWM}`);
        await updateSetting('packname', newWM);
        return m.reply(`✅ Watermark updated to: ${newWM}`);
      }
    }

    return m.reply(`📄 Current watermark: ${settings.packname || 'None'}\n\nUse _${settings.prefix}stickerwm null_ or _${settings.prefix}stickerwm <text>_`);
  });
});

dreaded({
  pattern: "settings",
  alias: [],
  desc: "Settings command",
  category: "Settings",
  filename: __filename
}, async (context) => {
const { client, args, m } = context;
  const settings = await getSettings();
  if (!settings) return m.reply("⚠️ No settings found in the database.");

  let response = `*Current Settings*\n`;
  response += `🔘 *Botname*: ${process.env.BOTNAME || settings.botname}\n`; 
  response += `🔘 *Prefix*: ${settings.prefix}\n`;
  response += `🔘 *Autoread*: ${settings.autoread ? '✅ ON' : '❌ OFF'}\n`;
  response += `🔘 *Autoview Status*: ${settings.autoview ? '✅ ON' : '❌ OFF'}\n`;
response += `🔘 *Antidelete*: ${settings.antidelete ? '✅ ON' : '❌ OFF'}\n`;
  response += `🔘 *Autolike Status*: ${settings.autolike ? '✅ ON' : '❌ OFF'}\n`;
  response += `🔘 *React Emoji*: ${settings.reactEmoji}\n`;
  response += `🔘 *Sticker Watermark*: ${settings.packname}\n`;
  
  response += `🔘 *Anticall*: ${settings.anticall ? '✅ ON' : '❌ OFF'}\n`;
  response += `🔘 *Presence*: ${settings.presence}\n`;

  const sudoUsers = await getSudoUsers();
  response += `\n*Statistics*\n`;
  response += `🔘 *Sudo Users*: ${sudoUsers.length > 0 ? sudoUsers.join(', ') : 'None'}\n`; 

  let groups = await client.groupFetchAllParticipating();
  let groupList = Object.entries(groups).map(([id, data]) => data.id);
  const bannedUsers = await getBannedUsers();

  response += `🔘 *Banned Users*: ${bannedUsers.length}\n`;  
  response += `🔘 *Total Groups*: ${groupList.length}\n`; 

  await m.reply(response);
});




dreaded({
  pattern: "unban",
  desc: "Unban command",
  category: "Settings",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
const { args, m, client} = context;
    let numberToUnban;

    if (m.quoted) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.quoted.sender);
      numberToUnban = jid.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      const groupContext = await client.getGroupContext(m, client.user.id);
      const jid = groupContext.getJidFromLid(m.mentionedJid[0]);
      numberToUnban = jid.split('@')[0];
    } else {
      numberToUnban = args[0];
      if (numberToUnban && numberToUnban.includes('@')) {
        numberToUnban = numberToUnban.split('@')[0];
      }
    }

    if (!numberToUnban) {
      return await m.reply('❌ Please provide a valid number or quote a user.');
    }

    numberToUnban = numberToUnban.replace(/\D/g, '');

    const bannedUsers = await getBannedUsers();

    if (!bannedUsers.includes(numberToUnban)) {
      return await m.reply('⚠️ This user was not banned before.');
    }

    await unbanUser(numberToUnban);
    await m.reply(`✅ ${numberToUnban} has been unbanned.`);
  });
});