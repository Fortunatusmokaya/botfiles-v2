const { getGroupSetting, getSudoUsers } = require("../Database/adapter");
const botname = process.env.BOTNAME || 'DREADED';

const Events = async (client, Fortu) => {
    const Myself = await client.decodeJid(client.user.id);

    try {
        const groupSettings = await getGroupSetting(Fortu.id);
        const adminevents = groupSettings?.adminevents;

        if (adminevents && Fortu.action === "demote") {
            const isBotAction = Fortu.author === Myself;
            await client.sendMessage(Fortu.id, {
                text: isBotAction
                    ? `I have demoted @${Fortu.participants[0].split("@")[0]}`
                    : `@${Fortu.author.split("@")[0]} has demoted @${Fortu.participants[0].split("@")[0]}`,
                mentions: [Fortu.author, Fortu.participants[0]]
            });
        }

        else if (adminevents && Fortu.action === "promote") {
            const isBotAction = Fortu.author === Myself;
            await client.sendMessage(Fortu.id, {
                text: isBotAction
                    ? `I have promoted @${Fortu.participants[0].split("@")[0]}`
                    : `@${Fortu.author.split("@")[0]} has promoted @${Fortu.participants[0].split("@")[0]}`,
                mentions: [Fortu.author, Fortu.participants[0]]
            });
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports = Events;