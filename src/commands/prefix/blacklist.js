const Guild = require('@schemas/guildBlackList');
const { getUser } = require('@schemas/User')
module.exports = {
  name: 'blacklist', 
  description: 'blacklist a guild or an user.',
  category: "OWNER", 

  async execute(message, args, client) {
  const sub = args[0]
  
  if (isNaN(args[1])) {
    return message.reply('ID must only contain Numbers');
  }
 const ID = args[1]
  switch (sub) {
    case 'g':
      const reason = args[2]
      await blacklistGuild(client, message, ID, reason)
      break;
    case 'rmG':
      await removeGuildBlacklist(client, message, ID)
      break;
    case 'u':
      const user = await client.users.fetch(args[1])
      await blacklistUser(client, user, message);
      break;
    case 'rmU':
      const userR = await client.users.fetch(args[1])
      await removeUserBlacklist(client, userR, message)
      break;
    default:
      message.reply('invalid usage')
      break;
  }
  }
}

async function blacklistGuild(client, message, ID,) {
    const guild = client.guilds.cache.get(ID); 
  const reason = message.content.split(' ').slice(3).join(' ') || 'Unknown';
   let guildName; 
   let guildId; 
  
   if (guild) { 
     guildName = guild.name; 
     guildId = guild.id; 
   } else { 
     guildName = "Unknown"; 
     guildId = ID; 
   } 
  
   let data = await Guild.findOne({ Guild: ID }).catch((err) => {}); 
   if (data) { 
     return message.reply(`This server is already blacklisted`)
   } 
  
   data = new Guild({ 
     Guild: guildId,
     Name: guildName,
     Reason: reason
   }); 
  
   await data.save();
   if (guild) {
   await guild.leave()
   }
    return message.reply(`Guild is Blacklisted.
__Guild Details__
- Name: ${guildName}
- ID: ${guildId}
- Reason: ${reason || 'Unknown'}`);
    }
    
async function removeGuildBlacklist(client, message, ID) {
    const guild = client.guilds.cache.get(ID); 
  
   let guildName; 
   let guildId; 
  
   if (guild) { 
     guildName = guild.name; 
     guildId = guild.id; 
   } else { 
     guildName = "Unknown"; 
     guildId = ID; 
   } 
  
   const data = await Guild.findOneAndDelete({ Guild: guildId }).catch((err) => {});
  if (!data) {
  return message.reply(`This server is not blacklisted`);
 }
  return message.reply(`Server Unblacklisted`);
}

async function blacklistUser(client, user, message) {
  if (!user) {
        return message.reply('Invalid User ID.')
      }
      const userDb = await getUser(user)
      userDb.isBlacklisted = true;
      await userDb.save();
     return message.reply(`${user.username} is blacklisted.`)
}

async function removeUserBlacklist(client, user, message) {
  if (!user) {
        return message.reply('Invalid User ID.')
      }
      const userDbR = await getUser(user)
      userDbR.isBlacklisted = false;
      await userDbR.save()
     return message.reply(`${user.username} is removed from blacklist.`)
  
}