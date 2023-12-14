<h1 align="center">
  <br>
  <a href="https://github.com/imnaiyar/SkyHelper"><img src="https://skyhelper.xyz/assets/img/skybot.png" height="200" alt="SkyHelper"></a>
  <br>
  SkyHelper
  <br>
</h1>

<p align="center">Shards, Next Shards, Seasonal Guides, Timestamp, Sky Times and more...</p>

<br>

<p align="center">
  <a href="https://skyhelper.xyz">Website</a>
  •
  <a href="https://skyhelper.xyz/invite">Invite</a>
  •
  <a href="https://skyhelper.xyz/vote">Vote</a>
  •
  <a href="https://docs.skyhelper.xyz">Documentation</a>
  •
  <a href="https://discord.com/invite/u9zUjWbbQ4">Support Server</a>
</p>

<br>
<div align="center">
  <a href="https://top.gg/bot/1121541967730450574">
    <img src="https://top.gg/api/widget/1121541967730450574.svg" alt="Discord Bots">
  </a>
</div>

## Running the bot
- Clone this repository by running
```js
git clone https://github.com/imnaiyar/SkyHelper
```
- Rename `example.env` to `.env` and fill all the required fields and also rename `ex.config.js` to `config.js` and `example.messageData.json` to `messageData.json`.
- Create a new folder in the root directory named `logs` (All the terminal and error logs will go here).
- Run ```npm run commands``` to register the slash commands.
If you want to register the slash commands to a specific guild, before running the above command, change this part in [commandsRegister.js](https://github.com/imnaiyar/SkyHelper/blob/main/src/commandsRegister.js)
```js
await rest.put( 
// Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // If you want the commands to be guild specific 

Routes.applicationCommands(client.user.id),  
         { body: commands }, 
       );
```
to 
```js
await rest.put( 
Routes.applicationGuildCommands(client.user.id, "Your Guild ID"),
         { body: commands }, 
       );
```
- Optionally, do the same in [register.js](https://github.com/imnaiyar/SkyHelper/blob/main/src/commands/prefix/register.js) if you're using prefix command to register.
- After installing all the dependencies by running ```npm i```, run ```npm start``` to start the bot.
- [Prefix Commands](https://github.com/imnaiyar/SkyHelper/tree/main/src%2Fcommands%2Fprefix) is for my personal use and you can chose to delete the folder if you wish. Should you delete, `messageCreate.js` event won't be needed either and you can remove that too.

# Credits
This bot wouldn't be possible without these people and the work they do.    
  
**__Shards Predictions__**
- Zhii (zhiiran4275)
- Christian (christiankingfu)
- Hucker (hucker_)  
- Plutoy (plutoy)  
- Kion (kion_anzu)  
- LN (ln.cookie)  
- Gale (galerowfylery)  
- Stoat (.stoat.)  
  
**__Seosanal Guides__**  
- Clement (clement8978)  
- Mimi (mimi4117)  
- Sam (sam6917)  
- Zed (zedlocked_)  
- Art (lovecry)  
**and all others who do the awesome job of creating guides.**  
  
**__Special Mentions__**  
- Big thanks to Xander (_a.l._) and Christian (christiankingfu) for testing the early version of this bot.  
- Thanks to Plutoy (plutoy) for creating the [Sky Shards website](https://sky-shards.pages.dev/), which was the initial inspiration for the bot.  
- Emotes icon, traveling spirits descriptions and some aspects of guides have been taken from [Sky Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).

<h6 align="center">This bot is not affiliated with Sky: Children of the Light or thatgamecompany<h6>
