var mongoose = require('mongoose');
var urlParser = require('url');
var fs = require('fs');

var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');

var Schema = mongoose.Schema;
var mongoUrl = 'mongodb://localhost:27017/users';
var db = null;
mongoose.connect(mongoUrl);

var modelsSchema = new Schema({
    uid: String,
    fName: String,
    modelsName: String,
    content: Buffer
}, {collection: 'ownData', minimize: false});


var modelsModel = mongoose.model('Models', modelsSchema);


exports.mongooseConnect = function() {
    db = mongoose.createConnection(mongoUrl);
};


//mongooseInsert function,  gets http object, makes document, 
//based on it's fields and insets it into the mongo db
exports.mongooseInsert = function(data, response, redirectUrl) {
    if ('fName' in data) {
        console.log('>>> m insert');
        fs.readFile(data['fPath'], (err, fData) => {
            if (err == null && fData != null) {
                var document = new modelsModel({
                    uid: data['uid'],
                    fName: data['fName'],
                    modelsName: data['model'],
                    content: fData
                });
                var validateRes = document.validateSync();
                if (validateRes == undefined) {
                    console.log('>>> validate ' + validateRes);
                    document.save(function (err) {
                        console.log('>>> save error = ' + err);
                    });
                }
                if (redirectUrl) {
                    response.writeHead(301, 'Moved Permanently', {'Location': redirectUrl});
                    response.end('');
                }
            }    
        });

    }
};


//mongooseFind function, finds and returns model's content
//resolves model by userId+modelName
exports.mongooseFind = function(request, response) {
    var urlObj = urlParser.parse(request.originalUrl, true);
    var content = null;
    var errString = null;
    if ('query' in urlObj && 'token' in urlObj['query']) {
        var findCond = {'uid': urlObj['query']['token'], 'modelsName': request.params.name};
        modelsModel.findOne(findCond, 'content', function(err, elem) {
            //console.log('>>> content = ' + content);
            if (err) {
                errString = '>>> mongoose error = ' + err;
            } else if (! elem) {
                errString = '>>> no content';
            } else if (! ('content' in elem)) {
                errString = '>>> no content in result';
            } else {
                content = elem['content'];
            };
            if (errString == null) {
                response.writeHead(200, 'Ok', {'Content-Type': 'plain/text'});
                response.end(content);
            }
        });
    };
    if (errString != null) {
        response.writeHead(404, 'Not Found', {'Content-Type': 'text/html'});
        response.end(errString);
    }
};



//mongooseGetAll function, read all models name, by userId,
//and returns them to the client
exports.mongooseGetAll = function(request, response) {
    var urlObj = urlParser.parse(request.originalUrl, true);
    var errString = null;    
    var result = null;
    if ('query' in urlObj && 'token' in urlObj['query']) {
        var findCond = {'uid': urlObj['query']['token']};
        modelsModel.find(findCond, 'modelsName', function(err, elems) {
            if (err) {
                errString = '>>> mongoose error = ' + err;
            } else if (! elems) {
                errString = '>>> no results'; 
            } else {
                result = '';
                for (i = 0; i < elems.length; i++) {
                    if ('modelsName' in elems[i]) {
                        result += elems[i]['modelsName'];
                        result += ':';
                    }
                }
                console.log('result is ' + result );
                if (result.length > 0 && result[result.length-1] == ':') {
                    result = result.substr(0, result.length-1);
                    response.writeHead(200, 'Ok', {'Content-Type': 'plain/text'});
                    response.end(result);
                } else if (errString == null) {
                    errString = '0 length result';
                }
            }
            
        });
    };
    if (errString != null) {
        response.writeHead(404, 'Not Found', {'Content-Type': 'text/html'});
        response.end(errString);
    } 
};
