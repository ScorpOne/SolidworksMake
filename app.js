var pathToRoot = './';
var express = require('express');
var http = require('http');
var pathServer = require('./server/paths.js');
var pathClient = require('./public/paths.js');
var controller = require(pathToRoot + pathServer.controllers.base);
var mongoController = require(pathToRoot + pathServer.controllers.mongo);
var socketController = require(pathToRoot + pathServer.controllers.socket);

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use('/static', controller.requestProcessing, express.static(__dirname + '/' + pathClient.clientPath));
app.use('/models', controller.modelRequestProcessing, express.static(__dirname + '/' + pathServer.models.stl));
app.use('/threeJs', express.static(__dirname + '/' + pathServer.node_modules.three));
app.use('/redis', controller.useRedis, express.static(__dirname + '/' + pathClient.clientPath));
app.use('/mongo', mongoController.mongoSelectRequest);

app.get('/api*', mongoController.mongoSelectRequest);
app.get('/', controller.getRoot);
app.get('*', controller.getAll);
app.post('/upload', controller.postUpload);

app.listen(8124);
mongoController.mongoConnect();

io.on('connection', socketController.onConnect);
