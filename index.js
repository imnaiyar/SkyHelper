require('dotenv').config();
require('module-alias/register');
require('./main');
require('@events/ready');
require('@events/guild/guildJoin');
require('@events/guild/guildLeave');
require('@events/presence');
require('@guides/GuideOption')
require('@handler/credits')
require('@handler/help.js')
require('@handler/SkyGPT')

require('@events/interaction/interactionCreate')







