const PtimesReply = async (message, args, geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr) => {
    const chosenOption = args[0];
  
    switch (chosenOption) {
      case 'geyser':
        message.reply(`Upcoming Geyser time for you: ${geyserResultStr}`);
        break;
  
      case 'grandma':
        message.reply(`${grandmaResultStr}
        __All Grandma Times:__
        > <t:1682839809:t> 》 <t:1682847009:t> 》<t:1682854209:t> 》<t:1682861400:t> 》<t:1682868600:t> 》<t:1682789400:t> 》<t:1682796600:t> 》<t:1682803800:t> 》<t:1682811000:t> 》 <t:1682818200:t> 》<t:1682825400:t> 》<t:1682832600:t>`);
        break;
  
      case 'reset':
        message.reply(`Next reset for you on: ${resetResultStr}`);
        break;
  
      case 'eden':
        message.reply(`Next eden reset for you on: ${edenResultStr}`);
        break;
  
      default:
        message.reply(`
\n\*\*Geyser (upcoming):\*\* ${geyserResultStr}\n
\*\*Grandma (upcoming):\*\* ${grandmaResultStr}\n
\*\*Reset (next):\*\* ${resetResultStr}\n
\*\*Eden (reset):\*\* ${edenResultStr}\n
    **Check individual commands for more information**`);
        break;
    }
  };
  
  module.exports = {
    PtimesReply
  };
  