var crc32 = require('crc-32');

// crc32Calc function simple calculates and returns
// abs value of crc32, which calculated from string 
// "client_ip + nanosec from last current sec"
exports.crc32Calc = function(request) {
    ipArray = request.connection.remoteAddress.split(':');  
    var hashString = ipArray[ipArray.length - 1];
    hashString += (':' + String(process.hrtime()[1]));
    console.log('>>> Hsh string is ' + hashString);
    return Math.abs(crc32.str(hashString));
}
