var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname + '/public')));
app.use("/bower_components", express.static(path.join(__dirname + '/bower_components')));

var api = require('./routes/api');
app.use('/', api);

module.exports = app;
