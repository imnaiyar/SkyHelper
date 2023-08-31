const { createSlashCommands } = require('./slashCommands');
const { timestampInteraction } = require('@handler/timestampHandler');
const {skyTimes} = require ('@handler/skyTimes');
const {shardsALt} = require('@shards/shardsAlt')

function registerEventHandlers() {
  createSlashCommands();
}

module.exports = {
  registerEventHandlers,
  timestampInteraction,
  skyTimes, shardsALt,
};
