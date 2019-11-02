const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');


const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dataProcess.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dataProcess.js'));
});

app.listen(3000);

module.export = app;