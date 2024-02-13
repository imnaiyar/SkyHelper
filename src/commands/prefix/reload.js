const { EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

/**
 * @type {import('@src/structures').PrefixCommands}
 */
module.exports = {
    data: {
        name: "reload",
        description: "reloads the bot",
        category: "OWNER",
        args: ['events', 'commands'],
        flags: ["both"],
    },
    /**
     * 
     * @param {*} message 
     * @param {*} args 
     * @param {import('@src/structures').SkyHelper} client 
     * @param {*} flags 
     * @returns 
     */
    async execute(message, args, client, flags) {
        try {
            const output = await consoleRun();
        const success = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Successfully reloaded ${args[0] ? args[0] : 'both commands and events'}.`)
            .setFields({name: 'Files changed', value: output.lenght > 4096 ? output.substr(0, 4000) : output})
            .setTimestamp()
          if (flags.lenght > 0 && flags.includes('both')) { 
            client.commands.clear();
                client.prefix.clear()
                client.loadSlashCmd('./src/commands')
                client.loadPrefix('./src/commands/prefix')
            client.loadEvents('./src/events')
            return message.channel.send({embeds: [success]})
         }
        
        switch (args[0]) {
            case 'commands': {
                client.commands.clear();
                client.prefix.clear()
                client.loadSlashCmd('./src/commands')
                client.loadPrefix('./src/commands/prefix')
                message.channel.send({embeds: [success]})
                break;
            }
            case 'events': {
                client.loadEvents('./src/events')
                message.channel.send({embeds: [success]})
                break;
            }
            default: message.reply(`Invalid args, please provide one of the args [${this.data.args}]`)
        }
    } catch (error) {
        const errorEmb = new EmbedBuilder()
        .setAuthor('☣️ Error')
        .setColor('Red')
        .setDescription(error)
        message.channel.send({embeds: [errorEmb]})
    }
    }
}


async function consoleRun() {
    return new Promise((resolve, reject) => {
        exec('git pull', (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
}