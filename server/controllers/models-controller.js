var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');
var commonFuncs = require(pathToRoot + serverPaths.helpers.commonFuncs);
var mongooseFuncs = require(pathToRoot + serverPaths.helpers.mongooseFuncs);


module.exports = {
    getAll: function(request, response) {
        console.log('get All ' + request.url);
        mongooseFuncs.mongooseGetAll(request, response);
    },


    getByName: function(request, response) {
        console.log('by name ' + request.params.name);
        mongooseFuncs.mongooseFind(request, response);
    },


    upload: function(request, response) {
        console.log('post ' + request.url);
        commonFuncs.uploadHandler(request, response, mongooseFuncs.mongooseInsert);
    },


    delByName: function(request, response) {
    },

    mongooseConnect: function() {
        mongooseFuncs.mongooseConnect();
    }

};