var fs = require('fs');
var multiparty = require('multiparty');
var pathResolver = require('path');
var urlParser = require('url');

const StringDecoder = require('string_decoder').StringDecoder;

var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');

var urlDefault = '/';
var urlUpload = '/upload';

// checkFileExist function - just check is file exists or isn't
// return true/false
function checkFileExist(fName, accessMode) {
    var ret = false;
    try {
        var fStat = fs.statSync(fName);	
        if (fStat.isFile) {
            if (accessMode) {
                fs.accessSync(fName, accessMode);
                ret = true;
            } else {
                ret = true;
            }
        }
    }
    catch (excp) {}
    return ret;	
}


// renameFiles function - renames uploaded files in local storage
// from temporary hash names to real file's names
function renameFiles(files, fPath) {
    if (fPath.length > 0 && fPath[fPath.length - 1] != '/') {
        fPath += '/';
    }
    for (var key in files) {
        var targetFile = fPath + key;

        if (checkFileExist(files[key])) {
            if (checkFileExist(targetFile)) {
                fs.unlinkSync(targetFile);
            }
            fs.renameSync(files[key], targetFile);
        }
    }
}


// responseStlFile function reads local stl file and returns its content 
// in http response (200 or 404 http response code if were something errors with 
// file)
exports.responseFile = function(fPath, urlPath, response, cType, replaceMacros) {
    fs.readFile(fPath + urlPath, (err, data) => {
        if (err) {
            var errString = '>>> fAccess error :' + err
            response.writeHead(404);
            response.end(errString);
        }
        else {
            if (replaceMacros) {
                try {
                    const decoder = new StringDecoder('utf8');
                    var strData = decoder.write(data);

                    for (var key in replaceMacros) {
                      strData = strData.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g,"g")), 
                                                replaceMacros[key]);
                    }
                    data = strData;
                } catch (err) {
                } 
            }
            response.writeHead(200, 'OK', {'Content-Type': cType});
            response.end(data);
        }
    });
}


// checkToken function checks "token" urls param for some urls which
// pathname finished by substrings from tokenUrlPathes list
exports.checkToken = function(url, urlObj) {
    var ret = true;
    var tokenUrlPathes = [urlDefault, urlUpload, '.html', '.htm', '.stl'];
    if (!urlObj) {
      urlObj = urlParser.parse(url, true);
    } 
    var urlPath = urlObj['pathname'];

    for (var i=0; i < tokenUrlPathes.length; i++) {
      var pos = urlPath.lastIndexOf(tokenUrlPathes[i]);
      //console.log(">>> token pos = " + pos);
      if (pos >= 0 && pos == (urlPath.length - tokenUrlPathes[i].length)) {
        if (!('query' in urlObj && 'token' in urlObj['query'])) {
          ret = false;
        }
        break;
      } 
    }
    console.log('>>> check token result = ' + ret);
    return ret;
}


// uploadHandler function - processes and save uploaded files
// also prepares and returns http response 
exports.uploadHandler = function(request, response) {
    var filesDict = {};
    var lastFormFileName = '';
    var stlPath = pathResolver.resolve(__dirname + '/' + pathToRoot + serverPaths.models.stl);
    console.log('>>> stl_path is ' + stlPath);
    var form = new multiparty.Form({'uploadDir': stlPath});
      
    form.on('part', function (part) {
    });

    form.on('file', function (name, file) {
      console.log('>>> [file] ' + file.originalFilename );
      console.log('>>> [file] ' + file.path);
      console.log('>>> [file] ' + file.headers);
      console.log('>>> [file] ' + file.size);
      console.log('>>> [file] ' + file.data);
      filesDict[file.originalFilename] = file.path;
      lastFormFileName = file.originalFilename;
    });

    form.on('field', function (name, value) {
      console.log('>>> [field]' + name);
    });


    form.on('close', function () {
      var redirectLocation = '/static/html/threeJsTest.html';
      if (lastFormFileName != '') {
        redirectLocation += '?stl=' + lastFormFileName;
      }
      var urlObj = urlParser.parse(request.url, true);
      if ('query' in urlObj && 'token' in urlObj['query']) {
        redirectLocation += ('&token=' + urlObj['query']['token']);
      }

      renameFiles(filesDict, stlPath);
      console.log('>>> [close] ---------------------------------');
      response.writeHead(301, 'Moved Permanently', {'Location': redirectLocation});
      response.end('');
    });
    form.parse(request);
}
