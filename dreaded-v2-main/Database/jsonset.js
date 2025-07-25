const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', '..', 'settings.json');

function getDefaultStructure() {
    return {
        globalSettings: {
            prefix: ".",
            packname: "dreaded v2 🤖",
            mode: "public",
            presence: "online",
            autoview: true,
            autolike: true,
            autoread: true,
            autobio: false,
            anticall: true,
            reactEmoji: "❤️"
        },
        groupDefaults: {
            antitag: true,
            antidelete: true,
            gcpresence: false,
            antiforeign: true,
            adminevents: false,
           
            events: false,
            antilink: true
        },
        groupSettings: {},
        bannedUsers: [],
        sudoUsers: [
            "254114018035",
            "254741889898"
        ],
        conversationHistory: {}
    };
}

function readData() {
    if (!fs.existsSync(settingsPath)) {
        const defaultData = getDefaultStructure();
        writeData(defaultData);
        return defaultData;
    }

    try {
        const raw = fs.readFileSync(settingsPath);
        return JSON.parse(raw);
    } catch (err) {
        console.error('[JSONSET] Error reading settings:', err);
        return getDefaultStructure();
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[JSONSET] Error writing settings:', err);
    }
}

// Global Settings
async function getSettings() {
    const data = readData();
    return data.globalSettings || {};
}

async function updateSetting(key, value) {
    const data = readData();

    
    if (value === 'true') value = true;
    else if (value === 'false') value = false;

    data.globalSettings[key] = value;
    writeData(data);
}

// Group Settings
async function getGroupSetting(jid) {
    const data = readData();
    if (!data.groupSettings[jid]) {
        data.groupSettings[jid] = { ...data.groupDefaults };
        writeData(data);
    }
    return data.groupSettings[jid];
}

async function updateGroupSetting(jid, key, value) {
    const data = readData();

    if (!data.groupSettings[jid]) {
        data.groupSettings[jid] = { ...data.groupDefaults };
    }

    
  if (value === 'true') value = true;
    else if (value === 'false') value = false;

    data.groupSettings[jid][key] = value;
    writeData(data);
}

async function getAllGroupSettings() {
    return readData().groupSettings || {};
}

// Banned Users
async function getBannedUsers() {
    return readData().bannedUsers || [];
}

async function banUser(num) {
    const data = readData();
    if (!data.bannedUsers.includes(num)) {
        data.bannedUsers.push(num);
        writeData(data);
    }
}

async function unbanUser(num) {
    const data = readData();
    data.bannedUsers = data.bannedUsers.filter(n => n !== num);
    writeData(data);
}

// Sudo Users
async function getSudoUsers() {
    return readData().sudoUsers || [];
}

async function addSudoUser(num) {
    const data = readData();
    if (!data.sudoUsers.includes(num)) {
        data.sudoUsers.push(num);
        writeData(data);
    }
}

async function removeSudoUser(num) {
    const data = readData();
    data.sudoUsers = data.sudoUsers.filter(n => n !== num);
    writeData(data);
}

// Conversations
async function saveConversation(num, role, message) {
    const data = readData();
    if (!data.conversationHistory[num]) {
        data.conversationHistory[num] = [];
    }

    data.conversationHistory[num].push({
        role,
        message,
        timestamp: Date.now()
    });

    writeData(data);
}

async function getRecentMessages(num) {
    const data = readData();
    return data.conversationHistory[num] || [];
}

async function deleteUserHistory(num) {
    const data = readData();
    delete data.conversationHistory[num];
    writeData(data);
}

module.exports = {
    getSettings,
    updateSetting,
    getGroupSetting,
    updateGroupSetting,
    getAllGroupSettings,
    getBannedUsers,
    banUser,
    unbanUser,
    getSudoUsers,
    addSudoUser,
    removeSudoUser,
    saveConversation,
    getRecentMessages,
    deleteUserHistory
};