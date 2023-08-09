// Only backup, no executable commands
module.exports = {
    name: 'ping',
    description: 'Get the this bot ping',
    async execute(message, client) {
        message.reply(`Pong: ${Math.round(client.ws.ping)}ms`);
    },
};