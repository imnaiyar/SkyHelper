[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&width=435&lines=SkyHelper;A+discord+bot+for+Sky%3A+Children+of+the+Light)](https://top.gg/bot/1121541967730450574)


[![Discord Bots](https://top.gg/api/widget/1121541967730450574.svg)](https://top.gg/bot/1121541967730450574)

# SkyHelper
Simple discord bot that has function related to Sky: Children of Lights.
# Commnads
`/shards` - Get today's shard information. You can also provide an additional date to look for shard details for that particular date.  
  `/seasonal_guide` - Various guides for each season. Includes Seasonal Quests, Seasonal Spirits Location, And their Previous Visit price tree(Seasonal chart if they have not visited at least once). **Only updated upto Season of Prophecy**  
  `/timestamp`- Convert the time given by user into unix timestamp. Default Timezone is set to California time(America/Los_Angeles), as this bot is primarily focused for Sky. But user can optionally provide a timezone if they want to convert it for that particular area.  
  `/sky-times` - Gives out upcoming times for Various Sky event(Grandma, Geyser, Reset, Eden Reset, Turtle).

## Running the bot
Clone this repository by running
```js
git clone https://github.com/imnaiyar/SkyHelper
```

Rename `.env.example` to `.env` and fill all the required fields.

Run ```npm run commands``` to register the slash commands.
If you want to register the command to a specific field, before running the command, change this part in [commandsRegister.js](https://github.com/imnaiyar/SkyHelper/blob/main/src/commandsRegister.js)
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
         Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
         { body: commands }, 
       );
```

After installing all the dependencies by running ```npm i```, run ```npm start``` to start the bot.

# Credits.
This bot wouldn't be possible without these people and the work they do.    
  
**__Shards Predictions__**  
● Zhii (zhiiran4275)  
● Christian (christiankingfu)  
● Hucker (hucker_)  
● Plutoy (plutoy)  
● Kion (kion_anzu)  
● LN (ln.cookie)  
● Gale (galerowfylery)  
● Stoat (.stoat.)  
  
**__Seosanal Guides__**  
● Clement (clement8978)  
● Mimi (mimi4117)  
● Sam (sam6917)  
● Zed (zedlocked_)  
● Art (lovecry)  
**and all others who do the awesome job of creating guides.**  
  
**__Special Mentions__**  
● Big thanks to Xander (_a.l._) and Christian (christiankingfu) for testing the early version of this bot.  
● Thanks to Plutoy (plutoy) for creating the [Sky Shards website](https://sky-shards.pages.dev/), which was the initial inspiration for the bot.  
● Emotes icon, traveling spirits descriptions and some aspects of guides have been taken from [Sky Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).

### This bot is not affiliated with Sky: Children of the Light or thatgamecompany.
