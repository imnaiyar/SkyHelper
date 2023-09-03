const { skyTimes } = require('@handler/skyTimes');

module.exports = {
  name: 'skyprefix', // Change this to your desired prefix command name
  description: 'Get various times related to the world of Sky', // Change this to your desired description

  async execute(message, args) {
    const command = args.shift().toLowerCase();
    switch (command) {
      case 'geyser':
        await skyTimes(message, args);
        break;
      case 'grandma':
        await skyTimes(message, args);
        break;
      case 'turtle':
        await skyTimes(message, args);
        break;
      case 'reset':
        await skyTimes(message, args);
        break;
      case 'eden':
        await skyTimes(message, args);
        break;
      default:
        message.reply('Invalid sub-command. Available sub-commands: geyser, grandma, turtle, reset, eden');
        break;
    }
  },
};
