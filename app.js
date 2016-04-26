var pathToRoot = './';
var express = require('express');
var http = require('http');
var pathServer = require('./server/paths.js');
var pathClient = require('./public/paths.js');
var controller = require(pathToRoot + pathServer.controllers.base);
var socketController = require(pathToRoot + pathServer.controllers.socket);
var modelsController = require(pathToRoot + pathServer.controllers.models);

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use('/static', controller.requestProcessing, express.static(__dirname + '/' + pathClient.clientPath));
app.use('/threeJs', express.static(__dirname + '/' + pathServer.node_modules.three));
app.use('/redis', controller.useRedis, express.static(__dirname + '/' + pathClient.clientPath));

app.get('/api/models/:name', modelsController.getByName);
app.get('/api/models', modelsController.getAll);
app.post('/api/models', modelsController.upload);
app.delete('/api/models:name', modelsController.delByName);

app.get('/', controller.getRoot);
app.get('*', controller.getAll);

app.listen(8124);
app.on('close', function() {
    console.log('>>> app closeee !');
});

process.on('SIGINT', function() {
    console.log('>>> closeee !');
    process.exit();
});

modelsController.mongooseConnect();

io.on('connection', socketController.onConnect);
