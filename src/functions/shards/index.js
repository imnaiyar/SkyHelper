const { shardsAlt } = require("./shardsAlt");
const { shardLocation } = require("./shardsLocation");
const { shardTimeline } = require("./shardsTimeline");
const { shardsReply } = require("./sub/shardsReply");
const { nextPrev } = require("./sub/scrollFunc");

module.exports = { shardsAlt, shardLocation, shardTimeline, shardsReply, nextPrev };
