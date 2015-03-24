var express = require('express');
var app = express();

app.use(express.static('public'));
app.use("/bower_components", express.static('bower_components'));

module.exports = app;