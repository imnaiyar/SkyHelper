const fetch = require("node-fetch"); 
  

 async function dblStats(client) { 
   await fetch(`https://discord.bots.gg/api/v1/bots/${client.user.id}/stats`, { 
     method: "POST", 
     body: JSON.stringify({ 
       guildCount: client.guilds.cache.size, 
       shardCount: 0, 
     }), 
     headers: { 
       "Content-Type": "application/json", 
       Authorization: `${process.env.DBL_TOKEN}`, 
     }, 
   }) 
     .then((response) => { 
       if (!response.ok) { 
         console.log(`Error Discord Bots: ${response.status}: ${response.statusText}`); 
         return response.text(); 
       } 
       return response.json(); 
     }) 
     .catch((error) => console.log(error)); 
 } 
  
  
 module.exports = { 
   dblStats, 
 };