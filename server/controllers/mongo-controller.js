var MongoClient = require('mongodb').MongoClient;
var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');
var mongoFuncs = require(pathToRoot + serverPaths.helpers.mongoFuncs);

var mongoUrl = 'mongodb://localhost:27017/users';
var mongoDb = null;
//var mongoResponse = '<html><body>%err% -- %result%</body></html>';
var mongoResponse = '%result%';


module.exports = {
    mongoResponse: function(response, err, result) {
        if (err == null) {
            err = 'OK';
        }
        response.writeHead(200, 'OK', {'Content-Type': 'plain/text'});
        var finalResult = '';
        if (result != null) {
            finalResult = result.join(':');
        }
        console.log('fResult = ' + finalResult);
        response.end(mongoResponse.replace('%err%', err).replace('%result%', finalResult));
    },


    mongoSelectRequest: function(request, response) {
        if (mongoDb != null) {
            console.log('.mongo select request');
            mongoFuncs.mongoSelect(request, response, mongoDb, module.exports.mongoResponse);
        }
    },


    mongoInserRequest: function(data, response) {
        if (mongoDb != null) {
            console.log('.mongo insert request');
            mongoFuncs.mongoInsert(data, response, mongoDb);
        }
    },


    mongoConnect: function() {
        MongoClient.connect(mongoUrl, function(err, db) {
            if (err == null) {
                console.log('Connected correctly to server.');
                mongoDb = db;
            }
//            db.close();
        });
    }
};