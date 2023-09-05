const fs = require('fs')
module.exports = { 
    name: "clearjson", 
    description: "clearjson", 
    category: "OWNER", 
 
    async execute(message, args) {
    
        try {
            if (args[0] === 'embed'){
            const newData = {};
            fs.writeFileSync('embedData.json', JSON.stringify(newData, null, 2));
         } else if (args[0] === 'message') {
            const newData = [];
            fs.writeFileSync('messageData.json', JSON.stringify(newData, null, 2));
         } else {
            return message.reply("**Invalid Comand Usage**\nAvailable Args: `embed`, `message`")
         }
        
         message.reply('Embed data has been cleared.');
          } catch (error) {

            console.error(error);
            message.reply('An error occurred while clearing embed data.');
          }
        }
    }        