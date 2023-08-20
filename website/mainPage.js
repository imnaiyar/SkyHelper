const express = require('express');

const app = express();

const path = require('path');

const PORT = 8080;
const tosRoute = require('./tos');

const privacyRoute = require('./privacy');
app.use(express.static(path.join(__dirname, 'page')));
app.use('/site2', express.static(path.join(__dirname, 'site2')));
app.use('/', tosRoute);

app.use('/', privacyRoute);
app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}`);

});

