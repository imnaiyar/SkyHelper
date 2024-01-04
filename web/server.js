const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const app = express();
const bodyParser = require('body-parser');
const webhookLogger = process.env.CONTACT_US
  ? new WebhookClient({ url: process.env.CONTACT_US })
  : undefined;
const router = express.Router();
module.exports = {
  loadWebsite: (client) => {
    const botData = mongoose.model('botStats');
    app
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({ extended: true }))
      .set('views', path.join(__dirname, 'views'))
      .set('view engine', 'ejs')
      .use('/', express.static(path.join(__dirname, 'views')))
      .use(async (req, res, next) => {
        try {
          const { botSettings } = require('@schemas/botStats');
          const settings = await botSettings(client);
          const stats = settings.data;
          res.locals.stats = stats;
          next();
        } catch (err) {
          console.error(err);
          res.locals.stats = null;
          next();
        }
      })
      .get('/', (req, res) => {
        res.render('index');
      })
      .get('/vote', (req, res) => {
        res.redirect('https://top.gg/bot/1121541967730450574/vote');
      })
      .get('/invite', (req, res) => {
        res.redirect(
          'https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&scope=bot+applications.commands&permissions=412317243584',
        );
      })
      .use(router)
      .post('/submit', (req, res) => {
        const { name, email, message, discordUsername } = req.body;
        try {
          let icon;
          if (discordUsername) {
            const user = client.users.cache
              .filter((u) => u.username === discordUsername)
              .first();
            icon = user ? user.displayAvatarURL() : undefined;
          } else {
            icon = undefined;
          }
          const embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: name || 'Not Provided', iconURL: icon })
            .addFields(
              {
                name: 'Email',
                value: email ? email : 'Not Provided',
              },
              {
                name: 'Username',
                value: discordUsername ? discordUsername : 'Not Provided',
              },
              {
                name: 'Message',
                value: message,
              },
            );
          if (webhookLogger) {
            webhookLogger
              .send({
                username: 'Contact Us Logs',
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
              })
              .catch((ex) => {});
          }
          res.status(200).send('Submission successful');
        } catch (err) {
          console.log(err);
          res.status(500).send('Server Error');
        }
      })
      .use((req, res) => {
        res.status(404).render('404');
      })
      .use((err, req, res, next) => {
        client.logger.error(err.stack);
        res.status(500).render('500');
      })
      .listen(client.config.DASHBOARD.port, () => {
        client.logger.log(
          `Server started running on port ${client.config.DASHBOARD.port}`,
        );
      });
  },
  timeRoute: (path, content) => {
    router.get(`/${path}`, (req, res) => {
      res.send(content);
    });
  },
};
