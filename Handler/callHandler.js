const { getSettings, getBannedUsers, banUser } = require("../Database/adapter");

const processedCalls = new Set();

module.exports = (client) => async (json) => {
  const settings = await getSettings();
  if (!settings?.anticall) return;

  const callId = json.content[0].attrs['call-id'];
  const callerJid = json.content[0].attrs['call-creator'];
  const callerNumber = callerJid.replace(/[@.a-z]/g, "");

  if (processedCalls.has(callId)) return;
  processedCalls.add(callId);

  try {
    await client.rejectCall(callId, callerJid);
    await client.sendMessage(callerJid, { text: "You will be banned for calling. Contact the owner!" });

    const bannedUsers = await getBannedUsers();
    if (!bannedUsers.includes(callerNumber)) {
      await banUser(callerNumber);
    }
  } catch (error) {
    console.error('Error handling call:', error);
  }
};