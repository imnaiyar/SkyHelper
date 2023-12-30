module.exports = {
  data: {
    name: 'register',
    description: 'deploy commands',
    category: 'OWNER',
  },

  async execute(message, args, client) {
    try {
      const reply = await message.reply(
        '<a:reload:1158269773835141181> Started refreshing application (/) commands.',
      );

      await client.registerCommands();
      await client.application.commands.fetch();
      await reply.edit(
        `✅️ Started refreshing application (/) commands.\n✅️ Registered ${client.application.commands.cache.size} commands`,
      );
    } catch (error) {
      client.logger.error(error);
    }
  },
};
