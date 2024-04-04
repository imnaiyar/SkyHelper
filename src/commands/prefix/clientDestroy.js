import Logger from '#src/logger';

export default {
  data: {
    name: "destroy",
    description: "Destroy client instance",
    category: "OWNER",
    aliases: ["ds"],
  },
  async execute(message, args, client) {
    const confirmationMessage = await message.channel.send("Are you sure you want to shut down the bot?");

    await confirmationMessage.react("✅");
    await confirmationMessage.react("❌");

    const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
    const collector = confirmationMessage.createReactionCollector({
      filter,
      time: 30000,
    });

    collector.on("collect", async (reaction) => {
      if (reaction.emoji.name === "✅") {
        await confirmationMessage.edit("Shutting down...");
        Logger.error("Bot is shutting down...");
        collector.stop();
        setTimeout(() => {
          process.exit(0);
        }, 5000);
      } else if (reaction.emoji.name === "❌") {
        await confirmationMessage.edit("Shutdown canceled.");
        collector.stop(); // Stop the collector
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        confirmationMessage.edit("Shutdown confirmation timed out. Shutdown canceled.");
      }
      confirmationMessage.reactions.removeAll().catch((error) => console.error("Failed to clear reactions:", error));
    });
  },
};
