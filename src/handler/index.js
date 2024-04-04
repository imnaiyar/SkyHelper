import { validations } from './validations';
import { cmdValidation } from './cmdValidation';

export default {
  buildShardEmbed: require("./buildShardEmbed"),
  deleteSchema: require("./deleteSchema"),
  buildTimesEmbed: require("./buildTimesEmbed"),
  parsePerm: require("./parsePerm"),
  recursiveReadDirSync: require("./recursiveReadDirSync"),
  btnHandler: require("./btnHandler"),
  buildTimeHTML: require("./buildTimeHTML"),
  setupPresence: require("./presence/presence"),
  updateUser: require("./updateUser"),
  validations,
  cmdValidation,
  createHaste: require("./createHastebin.js"),
};
