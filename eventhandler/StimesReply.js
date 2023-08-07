const StimesReply = async (interaction, geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr, turtleResultStr) => {
  const chosenOption = interaction.options.getString('times');

  switch (chosenOption) {
    case 'geyser':
      await interaction.reply(`\`Upcoming Geyser time for you:\`${geyserResultStr}\n**__All Geyser Times:__**
> <t:1682838027:t> 》<t:1682845227:t> 》<t:1682852427:t> 》<t:1682859627:t> 》<t:1682866827:t> 》<t:1682874027:t> 》<t:1682881227:t> 》<t:1682888427:t> 》<t:1682895627:t> 》<t:1682902827:t> 》<t:1682910027:t> 》<t:1682917227:t>`);
      break;
      
  case 'turtle':
      await interaction.reply(`\`Upcoming Turtle time for you:\`${turtleResultStr}\n**__All Turtle Times:__**
> <t:1682841024:t> 》<t:1682848224:t> 》<t:1682855424:t>》<t:1682862624:t>》<t:1682869824:t>》<t:1682877024:t>》<t:1682884224:t>》<t:1682891424:t>》<t:1682898624:t>》<t:1682905824:t>》<t:1682913024:t>》<t:1682920224:t>`);
       break;

    case 'grandma':
      await interaction.reply(`\` Upcoming Grandma time for you:\` ${grandmaResultStr}\n**__All Grandma Times:__**
> <t:1682839809:t> 》 <t:1682847009:t> 》<t:1682854209:t> 》<t:1682861400:t> 》<t:1682868600:t> 》<t:1682789400:t> 》<t:1682796600:t> 》<t:1682803800:t> 》<t:1682811000:t> 》 <t:1682818200:t> 》<t:1682825400:t> 》<t:1682832600:t> 》`);
      break;

    case 'reset':
      await interaction.reply(`\`Next reset for you on:\` ${resetResultStr}`);
      break;

    case 'eden':
      await interaction.reply(`\`Next eden reset for you on:\` ${edenResultStr}`);
      break;

    default:
      await interaction.reply(`\*\*\_\_Geyser(upcoming)\_\_\*\*: ${geyserResultStr}\n\n\*\*\_\_Grandma(upcoming)\_\_\*\*:${grandmaResultStr}\n\n\*\*\_\_Turtle(upcoming)\_\_\*\*:${turtleResultStr}\n\n\*\*\_\_Reset(next)\_\_\*\*:${resetResultStr}\n\n\*\*\_\_Eden(reset)\_\_\*\*: ${edenResultStr}\n\*\*Check individual commands for more information\*\*`);
      break;
  }
};

module.exports = {
  StimesReply
};
