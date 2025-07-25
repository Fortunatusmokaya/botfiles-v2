const dreaded = global.dreaded;
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

async function handlePrivacySetting({ client, m, text }, updateFn, settingName) {
  const availableSettings = {
    groupadd: ['all', 'contacts', 'contact_blacklist', 'none'],
    lastseen: ['all', 'contacts', 'contact_blacklist', 'none'],
    mypp: ['all', 'contacts', 'contact_blacklist', 'none'],
    mystatus: ['all', 'contacts', 'contact_blacklist', 'none'],
    online: ['all', 'match_last_seen']
  };

  if (!text) {
    return m.reply(`Provide a setting to be updated.\nExample: .${settingName} ${availableSettings[settingName][0]}`);
  }

  if (!availableSettings[settingName].includes(text)) {
    return m.reply(`Invalid option. Choose from: ${availableSettings[settingName].join('/')}`);
  }

  await updateFn(text);
  return m.reply(`${settingName.replace('mypp', 'Profile Picture').replace('mystatus', 'Status')} privacy updated to *${text}*`);
}


dreaded({
  pattern: "groupadd",
  desc: "Set who can add you to groups (all/contacts/contact_blacklist/none)",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    await handlePrivacySetting(context, 
      (setting) => client.updateGroupsAddPrivacy(setting),
      'groupadd'
    );
  });
});


dreaded({
  pattern: "lastseen",
  desc: "Set last seen privacy (all/contacts/contact_blacklist/none)",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { text, m, client } = context;
    await handlePrivacySetting({ client, m, text },
      (setting) => client.updateLastSeenPrivacy(setting),
      'lastseen'
    );
  });
});


dreaded({
  pattern: "mypp",
  desc: "Set profile picture privacy (all/contacts/contact_blacklist/none)",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { text, m, client } = context;
    await handlePrivacySetting({ client, m, text },
      (setting) => client.updateProfilePicturePrivacy(setting),
      'mypp'
    );
  });
});


dreaded({
  pattern: "mystatus",
  desc: "Set status privacy (all/contacts/contact_blacklist/none)",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { text, m, client } = context;
    await handlePrivacySetting({ client, m, text },
      (setting) => client.updateStatusPrivacy(setting),
      'mystatus'
    );
  });
});


dreaded({
  pattern: "online",
  desc: "Set online privacy (all/match_last_seen)",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, client, text } = context;
    await handlePrivacySetting({ client, m, text },
      (setting) => client.updateOnlinePrivacy(setting),
      'online'
    );
  });
});


dreaded({
  pattern: "privacy",
  desc: "View current privacy settings",
  category: "Wa-Privacy",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, client } = context;
    const Myself = await client.decodeJid(client.user.id);
    const {
      readreceipts,
      profile,
      status,
      online,
      last,
      groupadd,
      calladd
    } = await client.fetchPrivacySettings(true);

    const privacyInfo = `
*Current Privacy Settings*

• Name: ${client.user.name}
• Online: ${online}
• Profile Picture: ${profile}
• Last Seen: ${last}
• Read Receipts: ${readreceipts}
• Group Add: ${groupadd}
• Status: ${status}
• Call Add: ${calladd}
    `;

    const avatar = await client.profilePictureUrl(Myself, 'image')
      .catch(() => 'https://telegra.ph/file/b34645ca1e3a34f1b3978.jpg');

    await client.sendMessage(m.chat, { 
      image: { url: avatar }, 
      caption: privacyInfo 
    }, { quoted: m });
  });
});
