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

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use('/', express.static(path.join(__dirname, 'views')));

    app.use(async (req, res, next) => {
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
    });

    app
      .get('/', (req, res) => {
        res.render('index');
      })
      .use(router)
      .use((req, res) => {
        res.status(404).render('404');
      })
      .use((err, req, res, next) => {
        client.logger.error(err.stack);
        res.status(500).render('500');
      })
      .get('/vote', (req, res) => {
        res.redirect('https://top.gg/bot/1121541967730450574/vote');
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
