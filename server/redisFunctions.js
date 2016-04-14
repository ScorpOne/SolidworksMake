var Redis = require('ioredis');
var urlParser = require('url');
var fs = require('fs');

var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');

//var redisConnection = new Redis(serverPaths.redis.serverPort, serverPaths.redis.serverHort);
var httpOkResponseBody = '<html><body>%result%</body></html>';


function responseOk(response, resultString, redisConnection) {
    response.writeHead(200, 'OK', {'Content-Type': 'text/html'});
    response.end(httpOkResponseBody.replace('%result%', resultString));
    redisConnection.quit();
}


// main server method / requests income point
// Receive simple get requests with fName and fValue fields
// and makes simple set/get operations with Redis storage
exports.redisTest = function(request, response) {
    var redisConnection = new Redis(serverPaths.redis.serverPort, serverPaths.redis.serverHort);
    console.log('>>> method is ' + request.method + ' ' + request.url);
    console.log('>>> values is ' + serverPaths.redis.serverPort + ' ' + serverPaths.redis.serverHost);
    var resultString = ''; 
    var urlObj = urlParser.parse(request.url, true);      
    if ('query' in urlObj && 'fName' in urlObj['query'] && 'fValue' in urlObj['query']) {
        redisConnection.set(urlObj['query']['fName'], urlObj['query']['fValue']);
        redisConnection.get(urlObj['query']['fName'], function (err, result) {
            resultString = ('>>> Ok; result is = ' + result);
            console.log(resultString);
            responseOk(response, resultString, redisConnection);
        });
    } else {
        resultString = '>>> Err; some mandatory params are empty ';
    }

    if (resultString != '') {
        responseOk(response, resultString, redisConnection);
    }        
}

