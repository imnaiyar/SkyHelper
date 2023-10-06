const fs = require('fs');
const { PermissionsBitField } = require('discord.js');
const { client } = require('@root/main');
const { Configuration, OpenAIApi } = require('openai');
const { getSettings } = require('@schemas/Guild');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_TOKEN,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const settings = await getSettings(message.guild);

  if (!settings.skyGPT) return;
  const channel = message.guild.channels.cache.get(settings.skyGPT);
  if (message.channel.id === channel.id) {
    if (message.content.startsWith('?')) return;
    message.channel.sendTyping();
    try {
      let conversationLog = [
        {
          role: 'system',
          content:
            "You are a friendly SkyHelper who provides information of the game Sky: Children of the Light. You were created by NyR. You also provide Sky trivia randomly. You are cool, funny and sarcastic. Krills are also known as Dark Dragons. You don't help with anything that is not related to the game.There are seven realms in Sky, Isle of Dawn, Daylight Prairie,  Hidden Forest, Valley of Triumph, Vault of Knowledge.You can earn hearts by Making lots of friends and lighting them daily on Friendship constellation, trading with friends, Exchanging normal candles with past seasonal  guides, currently active seasonal guide gives free heart when you complete a quest for the first time, leaving message boats spell, memory spells and Shared Space spells across the realms which rewards a heart after certain likes. Current season is Season of Moments which began on July 17, 2023 and will end on Oct 1, 2023. Previous seasons upto Season of Moments in order are Season of Gratitude, Season of Lightseeker, Season of Belonging, Season of Rhythm, Season of Enchantment, Season of Sanctuary, Season of Prophecy, Season of Dreams, Season of Assembly, Season of the Little Prince, Season of Flight, Season of Abyss, Season of Performance , Season of Shattering, Season of Aurora, Season of Remembrance,  Season of Passage. Since you don`t have real time data, if someone asks where is shard, you can direct them to use the `\\shards` command built in the bot or alternatively you can direct them to this website creted by Plutoy https://sky-shards.pages.dev/. Make sure to remind people that your information could be outdated.",
        },
      ];
      conversationLog.push({
        role: 'user',
        content: message.content,
      });
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
      });
      const botReply = completion.data.choices[0].message;

      const botReplyStr1 = botReply.content.toString();
      const remainingRequests =
        completion.headers['x-ratelimit-remaining-requests'];
      const remainingRequestsTime =
        completion.headers['x-ratelimit-reset-requests'];
      const botReplyStr = `${botReplyStr1}\n\n**Requests remaining for the day:** ${remainingRequests} (+1 requests every ~7 minutes.)\n**Max request in (200):** ${remainingRequestsTime}`;

      const chunkSize = 2000;
      for (let i = 0; i < botReplyStr.length; i += chunkSize) {
        const chunk = botReplyStr.substring(i, i + chunkSize);
        message.reply(chunk);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      const requestsRemaining =
        error.response.headers['x-ratelimit-remaining-requests'];
      const remainingTime =
        error.response.headers['x-ratelimit-reset-requests'];
      const errorCode = error.response.status;
      if (requestsRemaining === '0') {
        message.reply(
          `Daily request limit reached, wait for ~6 minutes for one more request.\n\n**OpenAI error code**: ${errorCode}\n**Remaining requests**: ${requestsRemaining}\n**Time remaining for max requests(200) reset**: ${remainingTime} (This will increase everytime you make a request)`,
        );
      } else if (errorCode === 429 && requestsRemaining !== '0') {
        message.reply(
          `OpenAI ERROR CODE: ${errorCode}. Too many requests, only 3 requests allowed per minute, kindly wait before making a request.`,
        );
      }
      console.error('OpenAI API error:', error);
    }
  }
});
