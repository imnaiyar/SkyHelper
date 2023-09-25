const { ApplicationCommandOptionType } = require("discord.js");
const {skyTimes} = require('./sub/skyTimes')
const desc = require('@commands/cmdDesc')
module.exports = {
    data: {
      name: 'sky-times',
      description: 'Get various times related to the world of Sky',
      longDesc: desc.skytimes,
      options: [
        {
          name: 'times',
          description: 'Select a specific time you want.',
          type: ApplicationCommandOptionType.String,
          required: false, 
          choices: [
          { name: 'Geyser Time', value: 'geyser' },
          { name: 'Grandma Time', value: 'grandma' },
          { name: 'Turtle Time', value: 'turtle' },
          { name: 'Reset Time', value: 'reset' },
          { name: 'Eden Reset Time', value: 'eden' }
          ]
        },
      ],
    },
    async execute(interaction) {
      const result = await skyTimes()
    const chosenOption = interaction.options.getString('times');
  
    switch (chosenOption) {
      case 'geyser':
        await interaction.reply(`${result.geyserResultStr}\n**__All Geyser Times:__**
  > <t:1682838027:t> 》<t:1682845227:t> 》<t:1682852427:t> 》<t:1682859627:t> 》<t:1682866827:t> 》<t:1682874027:t> 》<t:1682881227:t> 》<t:1682888427:t> 》<t:1682895627:t> 》<t:1682902827:t> 》<t:1682910027:t> 》<t:1682917227:t>`);
        break;
        
    case 'turtle':
        await interaction.reply(`${result.turtleResultStr}\n**__All Turtle Times:__**
  > <t:1682841024:t> 》<t:1682848224:t> 》<t:1682855424:t>》<t:1682862624:t>》<t:1682869824:t>》<t:1682877024:t>》<t:1682884224:t>》<t:1682891424:t>》<t:1682898624:t>》<t:1682905824:t>》<t:1682913024:t>》<t:1682920224:t>`);
         break;
  
      case 'grandma':
        await interaction.reply(`${result.grandmaResultStr}\n**__All Grandma Times:__**
  > <t:1682839809:t> 》 <t:1682847009:t> 》<t:1682854209:t> 》<t:1682861400:t> 》<t:1682868600:t> 》<t:1682789400:t> 》<t:1682796600:t> 》<t:1682803800:t> 》<t:1682811000:t> 》 <t:1682818200:t> 》<t:1682825400:t> 》<t:1682832600:t> 》`);
        break;
  
      case 'reset':
        await interaction.reply(`\`Next reset for you on:\` ${result.resetResultStr}`);
        break;
  
      case 'eden':
        await interaction.reply(`\`Next eden reset for you on:\` ${result.edenResultStr}`);
        break;
  
      default:
        await interaction.reply(`In-game events time:\n- **Geyser(upcoming):** ${result.geyserResultStr}\n- **Grandma(upcoming):** ${result.grandmaResultStr}\n- **Turtle(upcoming):** ${result.turtleResultStr}\n- **Reset(next):** ${result.resetResultStr}\n- **Eden(reset):** ${result.edenResultStr}\n_Check individual commands for more information_`);
        break;
    }

    },
  };
  