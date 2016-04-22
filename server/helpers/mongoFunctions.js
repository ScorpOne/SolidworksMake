var urlParser = require('url');
var fs = require('fs');

var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');
var collectionName = 'models';

//var redisConnection = new Redis(serverPaths.redis.serverPort, serverPaths.redis.serverHort);
//var httpOkResponseBody = '<html><body>%result%</body></html>';

/*
function responseOk(response, resultString, redisConnection) {
    response.writeHead(200, 'OK', {'Content-Type': 'text/html'});
    response.end(httpOkResponseBody.replace('%result%', resultString));
    redisConnection.quit();
}
*/

//mongoInsert function,  gets http request, makes document, 
//based on it's fields and insets it into the mongo db
exports.mongoInsert = function(request, response, db, onInsertCallback) {
    var document = null;
    if (request.url) {
        var urlObj = urlParser.parse(request.url, true);      
        if ('query' in urlObj && 'fName' in urlObj['query'] && 'fId' in urlObj['query']) {
            document = {'name': urlObj['query']['fName'], 'status': urlObj['query']['fStatus'], 
                            'id': ('fId' in urlObj['query'] ? urlObj['query']['fId'] : '')};
        }
    } else {
        document = request;
    }
    if (document != null) {
        db.collection(collectionName).insertOne(document, function(err, result) {
            if (err != null) {
                console.log('>>> mongo err = ' + err);
            }
            if (onInsertCallback !== undefined) {
                onInsertCallback(response, err, null);
            }
        });
    }
};


exports.mongoSelect = function(request, response, db, onSelectCallback) {
    var urlObj = urlParser.parse(request.url, true);      
    if ('query' in urlObj && 'token' in urlObj['query']) {
        var result = [];
        var document = {'uid': urlObj['query']['token']};
        var cursor = db.collection(collectionName).find(document);
        cursor.each(function(err, elem) {
            if (elem != null) {
                if ('model' in elem && 'fName' in elem) {
                    result.push(elem['model']);
                    result.push(elem['fName']);
                }
            } else {
                if (onSelectCallback !== undefined) {
                    onSelectCallback(response, err, result);
                }
            }
        });
    }
};

