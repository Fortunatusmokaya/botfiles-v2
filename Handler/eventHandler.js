const { getGroupSetting, getSudoUsers } = require("../Database/adapter");
const botname = process.env.BOTNAME || 'DREADED';

const Events = async (client, Fortu) => {
    const Myself = await client.decodeJid(client.user.id);

    try {
        let metadata = await client.groupMetadata(Fortu.id);
        let desc = metadata.desc || "No Description";
        const groupSettings = await getGroupSetting(Fortu.id);
        const events = groupSettings?.events;
        const adminevents = groupSettings?.adminevents;
        const sudoUsers = await getSudoUsers();

        const DevDreaded = Array.isArray(sudoUsers) ? sudoUsers : [];
        const currentDevs = DevDreaded.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net");

        
        if (events && Fortu.action === "add") {
            for (let num of Fortu.participants) {
                let dpuser;
                try {
                    dpuser = await client.profilePictureUrl(num, "image");
                } catch {
                    dpuser = "https://telegra.ph/file/0a620a1cf04d3ba3874f5.jpg";
                }

                const userName = num;
                const Welcometext = `Holla @${userName.split("@")[0]} 👋\n\nWelcome to ${metadata.subject}.\n\nGroup Description: ${desc}\n\nThank You.\n\nThis is an automated message sent by ${botname} via Baileys.`;

                await client.sendMessage(Fortu.id, {
                    image: { url: dpuser },
                    caption: Welcometext,
                    mentions: [num],
                });
            }
        }

        
        else if (events && Fortu.action === "remove") {
            for (let num of Fortu.participants) {
                let dpuser;
                try {
                    dpuser = await client.profilePictureUrl(num, "image");
                } catch {
                    dpuser = "https://telegra.ph/file/0a620a1cf04d3ba3874f5.jpg";
                }

                const userName = num;
                const Lefttext = `Goodbye @${userName.split("@")[0]} 👋, probably not gonna miss you`;

                await client.sendMessage(Fortu.id, {
                    image: { url: dpuser },
                    caption: Lefttext,
                    mentions: [num],
                });
            }
        }

        
        else if (adminevents && Fortu.action === "demote") {
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