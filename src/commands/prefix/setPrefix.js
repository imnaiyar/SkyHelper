const {getSettings} = require("@schemas/Guild");
module.exports = { 
    name: "setprefix", 
    description: "Set a new prefix for this server", 
    userPermissions: "ManageGuild",
 
    async execute(message, args) {
        if (args.length !== 1) {
            return message.reply("Invalid command usage, use '!setprefix `prefix`'")
        }
        const settings = await getSettings(message.guild)
        settings.prefix = args[0]
        await settings.save()
        message.reply(`Prefix now set to ${args[0]}`)

    }
}