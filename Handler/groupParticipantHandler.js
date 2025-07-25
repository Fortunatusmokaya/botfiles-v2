const groupEvents = require("../Handler/eventHandler");
const groupEvents2 = require("../Handler/eventHandler2");

module.exports = (client, groupCache) => async (event) => {
  try {
    console.log(`Group participants updated: ${event.id}`);
    const metadata = await client.groupMetadata(event.id);
    groupCache.set(event.id, metadata);
  } catch (error) {
    console.error(`Error updating group metadata cache for ${event.id}:`, error);
  }

  groupEvents(client, event);
  groupEvents2(client, event);
};