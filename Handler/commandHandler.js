const fs = require('fs');
const path = require('path');

const cmdsDir = path.join(__dirname, '..', 'Cmds');
const commands = {};
const aliases = {};
let totalCommands = 0;

const defaultReactions = ['🔥', '💯', '⚡', '👀', '✅', '✨', '😎', '🧠'];

function dreaded(config, handler) {
    const {
        pattern,
        alias = [],
        desc = "",
        category = "General",
        react = "",
        filename = ""
    } = config;

    if (!pattern || typeof handler !== 'function') return;

    const name = pattern.toLowerCase();

    const wrapped = Object.assign(async (context) => {
        context.cmd = name;
        const { m, client } = context;

        let emoji = "";
        if (react) {
            emoji = Array.isArray(react) ? react[0] : react;
        } else {
            emoji = defaultReactions[Math.floor(Math.random() * defaultReactions.length)];
        }

        if (m?.key && client?.sendMessage && emoji) {
            try {
                await client.sendMessage(m.chat, {
                    react: { text: emoji, key: m.key }
                });
            } catch (err) {
                console.warn(`[WARN] Failed to send reaction for ${name}:`, err.message);
            }
        }

        await handler(context);
    }, { config });

    commands[name] = wrapped;
    alias.forEach(a => aliases[a.toLowerCase()] = name);
    totalCommands++;
}

global.commands = commands;
global.aliases = aliases;
global.totalCommands = totalCommands;
global.dreaded = dreaded;

function loadCommands(cmdsDir) {
    const files = fs.readdirSync(cmdsDir);
    files.forEach(file => {
        const filePath = path.join(cmdsDir, file);
        if (file.endsWith('.js')) {
            try {
                require(filePath);
            } catch (err) {
                console.error(`[ERROR] Failed to load ${file}:`, err.stack);
            }
        }
    });

    const commandCount = Object.keys(commands).length;
    const uniqueCategories = new Set(
        Object.values(commands).map(cmd => cmd?.config?.category || 'Uncategorized')
    );
}

loadCommands(cmdsDir);

module.exports = {
    commands,
    aliases,
    totalCommands,
    dreaded
};