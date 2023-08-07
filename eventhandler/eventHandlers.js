const { createSlashCommands } = require('./slashCommands');
const { timestampInteraction } = require('../interactionhandler/timestampHandler');
const {skyTimes} = require ('../interactionhandler/skyTimes');
const {shardsALt} = require('../interactionhandler/shards/shardsAlt')

function registerEventHandlers() {
  createSlashCommands();
}

module.exports = {
  registerEventHandlers,
  timestampInteraction,
  skyTimes, shardsALt,
};
