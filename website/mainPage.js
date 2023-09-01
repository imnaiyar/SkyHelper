const express = require('express');
const { DASHBOARD } = require("@root/config");

const app = express();

const path = require('path');

const PORT = DASHBOARD.port;
const tosRoute = require('./tos');

const privacyRoute = require('./privacy');
app.use('/', express.static(path.join(__dirname, 'page')));
app.use('/', tosRoute);

app.use('/', privacyRoute);
app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);

});

