var fs = require('fs');
var multiparty = require('multiparty');
var pathResolver = require('path');
var urlParser = require('url');

const StringDecoder = require('string_decoder').StringDecoder;

var pathToRoot = '../../';
var serverPaths = require(pathToRoot + 'server/paths.js');

var urlDefault = '/';
var urlUpload = '/upload';


// checkLastSubstr function - check str2 string as tail of str1
// return true/false
function checkLastSubstr(str1, str2) {
    var ret = false;
    var pos = str1.lastIndexOf(str2);
    if (pos >= 0 && pos == (str1.length - str2.length)) {
        ret = true;
    }
    return ret;
}


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
    var ret = false;
    var tokenUrlPathes = [urlDefault, urlUpload, '.html', '.htm', '.stl'];
    var tokenUrlPathesExcludes = ['index.html'];
    if (!urlObj) {
        urlObj = urlParser.parse(url, true);
    } 
    var urlPath = urlObj['pathname'];

    for (var i=0; i < tokenUrlPathesExcludes.length; i++) {
        if (checkLastSubstr(urlPath, tokenUrlPathesExcludes[i])) {
            ret = true;
            break;
        }
    }
    if (!ret) {
        ret = true;
        for (var i=0; i < tokenUrlPathes.length; i++) {
            if (checkLastSubstr(urlPath, tokenUrlPathes[i])) {
                if (!('query' in urlObj && 'token' in urlObj['query'])) {
                    ret = false;
                }
                break;
            } 
        }
    }
    console.log('>>> check token result = ' + ret);
    return ret;
}


// uploadHandler function - processes and save uploaded files
// also prepares and returns http response 
exports.uploadHandler = function(request, response, callback) {
    var result = {}
    var filesDict = {};
    var lastFormFileName = '';
    var stlPath = pathResolver.resolve(__dirname + '/' + pathToRoot + serverPaths.models.stl);
    console.log('>>> stl_path is ' + stlPath);
    var form = new multiparty.Form({'uploadDir': stlPath});
      
    form.on('part', function(part) {
    });

    form.on('file', function(name, file) {
        console.log('>>> [file] ' + file.originalFilename);
        console.log('>>> [file] ' + file.path);
        console.log('>>> [file] ' + file.headers);
        console.log('>>> [file] ' + file.size);
        console.log('>>> [file] ' + file.data);
        filesDict[file.originalFilename] = file.path;
        lastFormFileName = file.originalFilename;
        result['fName'] = file.originalFilename;
    });

    form.on('field', function(name, value) {
        console.log('>>> [field]' + name);
        if (name == 'model') {
            result['model'] = value;
        }
    });


    form.on('close', function() {
        var redirectLocation = '/static/html/threeJsTest.html';
        if (lastFormFileName != '') {
            redirectLocation += '?stl=' + lastFormFileName;
        }
        var urlObj = urlParser.parse(request.url, true);
        if ('query' in urlObj && 'token' in urlObj['query']) {
            result['uid'] = urlObj['query']['token'];
            redirectLocation += ('&token=' + urlObj['query']['token']);
        }

        renameFiles(filesDict, stlPath);
        console.log('>>> [close] ---------------------------------');
        response.writeHead(301, 'Moved Permanently', {'Location': redirectLocation});
        response.end('');

        if ('model' in result && result['model'] == '' && 'fName' in result) {
            result['model'] = result['fName'];
        }
        if (callback) {
            callback(result, response);
        }
    });
    form.parse(request);
}
