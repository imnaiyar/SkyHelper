const express = require('express');
const { DASHBOARD } = require('@root/config');
const { botSettings } = require('@schemas/botStats');
const path = require('path');
const app = express();
const htmlUtils = require('./htmlUtils');
const PORT = DASHBOARD.port;
async function unixPage(interaction, fieldsData, unixTime, offset, timezone) {
  const html = await htmlUtils(
    interaction,
    fieldsData,
    unixTime,
    offset,
    timezone,
  );
  app.get(`/${interaction.id}`, (req, res) => {
    res.send(html.Content);
  });
}
function loadWebsite(client) {
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
      const stats = settings.data;
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
    const redirectUrl =
      'https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&permissions=412317240384&scope=bot%20applications.commands';

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
      <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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


<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://skyhelper.xyz/invite" />
<meta property="twitter:title" content="SkyHelper" />
<meta property="twitter:description" content="SkyHelper is a versatile Discord bot designed to enhance the Sky: Children of the Light gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky." />
<meta property="twitter:image" content="https://skyhelper.xyz/assets/img/skybotLong.png" />
      <meta http-equiv="refresh" content="3;url=${redirectUrl}">
      <meta name="title" content="Invite SkyHelper" />

      </head>
      <body>
      <div class="header">
    <img src="https://skyhelper.xyz/assets/img/tsLogo.png" align="left" style="width: 50px; height: 50px; padding-right:10px;"/>
    <div class="word text-xl font-bold text">
    <b> <span>S</span> 
     <span>k</span> 
     <span>y</span> 
     <span>H</span> 
     <span>e</span> 
     <span>l</span> 
     <span>p</span> 
     <span>e</span>
     <span>r</span>
     </b>
   </div> 
    </div>
    <br>
    <br>
<h1>Redirecting...</h1>
<div class="slider">
	<div class="line"></div>
	<div class="break dot1"></div>
	<div class="break dot2"></div>
	<div class="break dot3"></div>
</div>
<p>Not working? <a href="https://discord.com/api/oauth2/authorize?client_id=1121541967730450574&permissions=412317240384&scope=bot%20applications.commands">Click here.</a></p>
<style>
@import url(https://fonts.googleapis.com/css?family=Raleway:100);
 @import url("https://fonts.googleapis.com/css?family=Dosis"); 
  
     .word { 
       font-family: "Dosis", sans-serif; 
       perspective: 1000px; 
     } 
  
     .word span { 
       cursor: pointer; 
       display: inline-block; 
       font-size: 25px;
       padding-top: 15px;
       user-select: none; 
       line-height: 0.8; 
     } 
  
  
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%; /* Make it span the full width of the viewport */
    padding: 10px; /* Add padding for spacing if desired */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Optional: Add a shadow for better visibility */
}
body{
background:#222;
margin: 40px 50px;
justify-content: center;
align-items: center;
height: 100vh;
color:#4a8df8;
font-family: 'Raleway', cursive;
font-weight:100;
}
h1{
color:#4a8df8;
font-family: 'Raleway', cursive;
font-weight:100;
font-stretch:normal;
font-size:3em;
}
a{
color:#4a8df8;
font-family: 'Raleway', cursive;
}
.slider{
position:absolute;
width:400px;
height:2px;
margin-top:-30px;
}
.line{
position:absolute;
background:#4a8df8;
width: 90vw;
height:2px;
}
.break{
position:absolute;
background:#222;
width:6px;
height:2px;
}
 
.dot1{
-webkit-animation: loading 2s infinite;
-moz-animation: loading 2s infinite;
-ms-animation: loading 2s infinite;
-o-animation: loading 2s infinite;
animation: loading 2s infinite;
}
.dot2{
-webkit-animation: loading 2s 0.5s infinite;
-moz-animation: loading 2s 0.5s infinite;
-ms-animation: loading 2s 0.5s infinite;
-o-animation: loading 2s 0.5s infinite;
animation: loading 2s 0.5s infinite;
}
.dot3{
-webkit-animation: loading 2s 1s infinite;
-moz-animation: loading 2s 1s infinite;
-ms-animation: loading 2s 1s infinite;
-o-animation: loading 2s 1s infinite;
animation: loading 2s 1s infinite;
}

@keyframes "loading" {
from { left: 0; }
to { left: 90vw; }
}
@-moz-keyframes loading {
from { left: 0; }
to { left: 90vw; }
}
@-webkit-keyframes "loading" {
from { left: 0; }
to { left: 90vw; }
}
@-ms-keyframes "loading" {
from { left: 0; }
to { left: 90vw; }
}
@-o-keyframes "loading" {
from { left: 0; }
to { left: 90vw; }

@media (max-width: 400px) {
    @keyframes loading {
        to { left: 400px; /* Change to 400px if viewport is narrower */ }
    }
}
    </style>
      </body>
    </html>`;

    res.send(html);
  });
  app.get('/vote', (req, res) => {
    res.redirect('https://top.gg/bot/1121541967730450574/vote');
  });
  app.listen(PORT, () => {
    client.logger.success(`Server is running on port ${PORT}`);
  });
}
module.exports = { unixPage, loadWebsite };
