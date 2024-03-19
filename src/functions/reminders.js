module.exports = async (client, type) => {
  const guilds = client.guilds.cache;
  const reminder = getReminder(type);
  guilds.forEach( async (guild) => {
   const settings = await client.database.Guild.getSettings(guild);
   const rmd = settings?.reminder;
   if (!rmd) return;
   const { grandma, geyser, dailies, turtle, eden, channel } = rmd;
   if (!grandma && !geyser && !eden && !turtle && !dailies) return;
   const wb = await client.fetchWebhooks(channel);
   if (!wb) return;
   wb.send(reminder).catch(err => {});
  });
};