const { database } = require('../Env/settings');

let db;

if (database && database.trim() !== '') {
    console.log('[DB] Using PostgreSQL backend');
    db = require('./config');
} else {
    console.log('[DB] Falling back to JSON backend');
    db = require('./jsonset');
}


const {
    connectToDB,
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
    initializeDatabase,
    deleteUserHistory
} = db;

module.exports = {
    connectToDB,
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
    initializeDatabase,
    deleteUserHistory
};