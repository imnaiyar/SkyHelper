const express = require('express');
const { DASHBOARD } = require('@root/config');
const { botSettings } = require("@schemas/botStats");
const path = require('path');
const { client } = require('@root/main')
const Logger = require('@src/logger')
const app = express();
const PORT = DASHBOARD.port;


app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use('/', express.static(path.join(__dirname, 'views', 'page')));


const tosRoute = require('./tos');
const privacyRoute = require('./privacy');
app.use('/', tosRoute);
app.use('/', privacyRoute);

app.use(async (req, res, next) => {
  try {
    const settings = await botSettings(client);
    const stats = settings.data
    res.locals.stats = stats;
    next();
  } catch (err) {
    console.error(err);
    res.locals.stats = null;
    next();
  }
});

app.get('/', (req, res) => {
  res.render('page/index');
});

app.listen(PORT, () => {
  Logger.success(`Server is running on port ${PORT}`);
});
