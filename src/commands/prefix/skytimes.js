const { skyTimes } = require('@commands/slash/skytimes/sub/skyTimes');
const desc = require('../cmdDesc')
module.exports = {
  data: {
  name: 'skytimes', 
  description: 'Get various times related to the world of Sky',
  longDesc: desc.pSkytimes,
  },
  async execute(message, args) {
    const result = await skyTimes()
    if (args.length === 0) {
        return message.reply(`In-game events time:\n- **Geyser(upcoming):** ${result.geyserResultStr}\n- **Grandma(upcoming):** ${result.grandmaResultStr}\n- **Turtle(upcoming):** ${result.turtleResultStr}\n- **Reset(next):** ${result.resetResultStr}\n- **Eden(reset):** ${result.edenResultStr}\n_Check individual commands for more information_`)
    }
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'geyser':
        message.reply(`${result.geyserResultStr}\n**__All Geyser Times:__**
        > <t:1682838027:t> 》<t:1682845227:t> 》<t:1682852427:t> 》<t:1682859627:t> 》<t:1682866827:t> 》<t:1682874027:t> 》<t:1682881227:t> 》<t:1682888427:t> 》<t:1682895627:t> 》<t:1682902827:t> 》<t:1682910027:t> 》<t:1682917227:t>`)
        break;
      case 'grandma':
        message.reply(`${result.grandmaResultStr}\n**__All Grandma Times:__**
        > <t:1682839809:t> 》 <t:1682847009:t> 》<t:1682854209:t> 》<t:1682861400:t> 》<t:1682868600:t> 》<t:1682789400:t> 》<t:1682796600:t> 》<t:1682803800:t> 》<t:1682811000:t> 》 <t:1682818200:t> 》<t:1682825400:t> 》<t:1682832600:t> 》`)      
        break;
      case 'turtle':
        message.reply(`${result.turtleResultStr}\n**__All Turtle Times:__**
        > <t:1682841024:t> 》<t:1682848224:t> 》<t:1682855424:t>》<t:1682862624:t>》<t:1682869824:t>》<t:1682877024:t>》<t:1682884224:t>》<t:1682891424:t>》<t:1682898624:t>》<t:1682905824:t>》<t:1682913024:t>》<t:1682920224:t>`);      
        break;
      case 'reset':
        message.reply(`Reset time for you: ${result.resetResultStr}`)
        break;
      case 'eden':
        message.reply(`Eden Reset time for you: ${result.edenResultStr}`)
        break;
      default:
        message.reply("Invalid sub-command.\nSub-commands: ` geyser `, ` grandma `, ` turtle `, ` reset ` , ` eden `");
        break;
    }
  },
};
