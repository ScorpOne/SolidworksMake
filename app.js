var pathToRoot = './';
var express = require('express');
var pathServer = require('./server/paths.js');
var pathClient = require('./public/paths.js');
var controller = require(pathToRoot + pathServer.controllers.base);

var app = express();

app.use('/static', controller.requestProcessing, express.static(__dirname + '/' + pathClient.clientPath));
app.use('/models', controller.modelRequestProcessing, express.static(__dirname + '/' + pathServer.models.stl));
app.use('/threeJs', express.static(__dirname + '/' + pathServer.node_modules.three));
app.use('/redis', controller.useRedis, express.static(__dirname + '/' + pathClient.clientPath));

app.get('/', controller.getRoot);
app.get('*', controller.getAll);
app.post('/upload', controller.postUpload);

app.listen(8124);
