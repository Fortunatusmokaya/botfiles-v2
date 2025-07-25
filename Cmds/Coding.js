const dreaded = global.dreaded;
const fetch = require('node-fetch');
const Obf = require("javascript-obfuscator");
const { c, cpp, node, python, java } = require('compile-run');
const fs = require('fs');
const path = require('path');
const { obfuscateJS } = require("../Scrapers/obfuscator");

dreaded({
  pattern: "encrypt2",
  desc: "Encrypt command using PreEmptive and send as file",
  alias: ["enc2", "obf2"],
  category: "Coding",
  filename: __filename
}, async ({ m, client }) => {
  if (m.quoted && m.quoted.text) {
    const code = m.quoted.text;

    try {
      const result = await obfuscateJS(code);
      const filename = `obfuscated.js`;
      const filepath = path.join(__dirname, "temp", filename);

      
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath));
      }

      fs.writeFileSync(filepath, result);

      await client.sendMessage(m.chat, {
        document: fs.readFileSync(filepath),
        fileName: filename,
        mimetype: 'application/javascript',
        caption: '✅ Obfuscated successfully..'
      }, { quoted: m });

      
      fs.unlinkSync(filepath);

    } catch (err) {
      console.error("❌ Obfuscation failed:", err.message);
      m.reply("Failed to encrypt the code.\n" + err.message);
    }

  } else {
    m.reply("Tag a valid JavaScript code to encrypt using PreEmptive!");
  }
});


dreaded({
  pattern: "carbon",
  desc: "Carbon command",
  category: "Coding",
  filename: __filename
}, async (context) => {
  const { client, m, text, botname } = context;
  const cap = `Converted By ${botname}`;

  if (m.quoted && m.quoted.text) {
    const code = m.quoted.text;

    try {
      const response = await fetch('https://carbonara.solopov.dev/api/cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, backgroundColor: '#1F816D' }),
      });

      if (!response.ok) return m.reply('API failed to fetch a valid response.');

      const buffer = await response.buffer();
      await client.sendMessage(m.chat, { image: buffer, caption: cap }, { quoted: m });

    } catch (error) {
      m.reply("An error occurred:\n" + error);
    }
  } else {
    m.reply('Quote a code message');
  }
});

dreaded({
  pattern: "encrypt",
  desc: "Encrypt command",
alias: ["enc", "obf"],
  category: "Coding",
  filename: __filename
}, async ({ m }) => {
  if (m.quoted && m.quoted.text) {
    const code = m.quoted.text;

    const obfuscationResult = Obf.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1
    });

    console.log("Successfully encrypted the code");
    m.reply(obfuscationResult.getObfuscatedCode());
  } else {
    m.reply("Tag a valid JavaScript code to encrypt!");
  }
});

const runners = {
  "runcpp": cpp,
  "runc": c,
  "runjava": java,
  "runjs": node,
  "runpy": python
};

for (const [pattern, engine] of Object.entries(runners)) {
  dreaded({
    pattern,
    desc: `${pattern} command`,
    category: "Coding",
    filename: __filename
  }, async ({ m }) => {
    if (m.quoted && m.quoted.text) {
      const code = m.quoted.text;

      try {
        const result = await engine.runSource(code);
        if (result.stdout) await m.reply(result.stdout);
        if (result.stderr) await m.reply(result.stderr);
      } catch (err) {
        console.error(err);
        m.reply(err?.stderr || 'An error occurred while running code.');
      }

    } else {
      m.reply(`Quote a valid and short ${pattern.replace('run-', '')} code to compile`);
    }
  });
}
