const express = require('express');
const { DASHBOARD } = require('@root/config');
const { botSettings } = require("@schemas/botStats");
const path = require('path');
const { client } = require('@root/main')
const Logger = require('@src/logger')
const app = express();
const htmlUtils = require('./htmlUtils')
const PORT = DASHBOARD.port;
async function unixPage(interaction, fieldsData, unixTime, offset, timezone) {
  const html = await htmlUtils(interaction, fieldsData, unixTime, offset, timezone)
app.get(`/${interaction.id}`, (req, res) => {

  res.send(html.Content);
});
}
module.exports = { unixPage }
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


app.get('/invite', (req, res) => {
  const redirectUrl = 'https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&permissions=412317240384&scope=bot%20applications.commands';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
      <meta name="title" content="Invite SkyHelper" />
<meta name="description" content="SkyHelper is a versatile Discord bot designed to enhance the Sky: Children of the Light gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky." />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://skyhelper.xyz/invite" />
<meta property="og:title" content="Invite SkyHelper" />
<meta property="og:description" content="SkyHelper is a versatile Discord bot designed to enhance the Sky: Children of the Light gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky." />
<meta property="og:image" content="https://skyhelper.xyz/assets/img/skybotLong.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="og:site_name" content="Add SkyHelper to your server!"/>
<meta name="theme-color" content="#FF0000">


<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://skyhelper.xyz/invite" />
<meta property="twitter:title" content="SkyHelper" />
<meta property="twitter:description" content="SkyHelper is a versatile Discord bot designed to enhance the Sky: Children of the Light gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky." />
<meta property="twitter:image" content="https://skyhelper.xyz/assets/img/skybotLong.png" />
        <meta http-equiv="refresh" content="0;url=${redirectUrl}">
      </head>
      <body>
        Redirecting...
      </body>
    </html>`;
  
  res.send(html);
});
app.listen(PORT, () => {
  Logger.success(`Server is running on port ${PORT}`);
});
