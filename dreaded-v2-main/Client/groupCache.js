const NodeCache = require("node-cache");

const groupCache = new NodeCache({
  stdTTL: 5 * 60,     
  useClones: false,      
  checkperiod: 60         
});

module.exports = groupCache;