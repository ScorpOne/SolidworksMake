var multiparty = require('multiparty');
var urlParser = require('url');
var pathResolver = require('path');
var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');
var clientPaths = require(pathToRoot + 'public/paths.js');
var commonFuncs = require(pathToRoot + serverPaths.helpers.commonFuncs);
var redisFuncs = require(pathToRoot + serverPaths.helpers.redisFuncs);
var mongoController = require(pathToRoot + serverPaths.controllers.mongo);

var notFoundBody = '<!DOCTYPE html><html><body> your request not service by our server</body></html>';

module.exports = {
    requestProcessing: function(request, response, next){
        if (commonFuncs.checkToken(request.url)) {
            next();
        } else {
            var token = 'Tiger';
            response.writeHead(301, 'Moved Permanently', {'Location': 'registration.html?token=' + token});
            response.end('');
        }
    },


    modelRequestProcessing: function(request, response, next){
        console.log('getModels ' + request.url);
        if (commonFuncs.checkToken(request.url)) {
            next();
        } else {
            response.writeHead(404, 'Not Found');
            response.end('');
        }
    },


    useRedis: function(request, response, next){
        urlObj = urlParser.parse(request.url, false);
        console.log('useRedis ' + request.url + ' path ' + urlObj['pathname']);
        switch(urlObj['pathname']) {
            case clientPaths.redis.html:
                next();
                break;
            case clientPaths.redis.def:
                redisFuncs.redisTest(request, response);
                break;
            default:
                response.writeHead(404, 'Not Found', {'Content-Type': 'text/html'});
                response.end(notFoundBody);
        }
    },


    getRoot: function(request, response){
        console.log('getRoot ' + request.url);
        commonGetRequest(request, response, '', pathToRoot + clientPaths.clientHtmlPath + 'index.html');
    },


    getAll: function(request, response){
        console.log('getAll ' + request.url);
        response.writeHead(404, 'Not Found', {'Content-Type': 'text/html'});
        response.end(notFoundBody);
    },


    postUpload: function(request, response){
        console.log('post ' + request.url);
        var uploadResult = commonFuncs.uploadHandler(request, response, mongoController.mongoInserRequest);
    }
};