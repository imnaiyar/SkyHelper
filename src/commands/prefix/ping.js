
module.exports = {
  data: {
  name: 'ping', 
  description: 'get the bot\'s ping', 
  },
  async execute(message, args) {
  const { client } = message
 message.reply(`🏓 Message Latency is ${Date.now() - message.createdTimestamp}ms.\n🏓 Websocket Latency is ${Math.round(client.ws.ping)}ms`)
}
}