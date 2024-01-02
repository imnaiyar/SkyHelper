const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
module.exports = {
  loadWebsite: (client) => {
    app.use(bodyParser.json());
    const botData = mongoose.model('botStats');

    app.set('views', path.join(__dirname, 'views'))
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
    res.redirect('https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&scope=bot+applications.commands&permissions=412317243584');
      })
      .use(router)
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
