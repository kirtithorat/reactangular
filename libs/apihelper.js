var https = require('https');
var fs = require('fs');
var secret = require('../config/secret');
var dbhelper = require('./dbhelper');

var getOptions = function () {
    // Getting http options from config/secret.js whose format is as below:
    /*
   {
        'bcAuth': {
            'host': 'www.example.com',
            'username': 'your_username',
            'password': 'your_password',
            'urlPath': '/api/v1/products', // Add api path
            'caPath': '...' // ca bundle path
        },
        'mongodb': {
            'url': '...' // mongodb url
        }
    }; 
    */
    var options = {
        hostname: secret.bcAuth.host, // use with www. (in case of sub-domain don't use www.)
        path: secret.bcAuth.urlPath,
        method: 'GET',
        auth: secret.bcAuth.username + ':' + secret.bcAuth.password,
        ca: fs.readFileSync(secret.bcAuth.caPath),
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
                'Accept': 'application/json'
        }
    };

    return options;
};


var getProductData = function (callback) {
    // Get Request Options
    var options = getOptions();
    console.log("API : getProductData");
    // make API Request
    var req = https.request(options, function (res) {
        // console.log("statusCode: ", res.statusCode);
        // console.log("headers: ", res.headers);

        var chunk = '';
        res.on('data', function (d) {
            chunk += d;
        });

        res.on('end', function () {
            if (res.statusCode !== 200) {
                callback(JSON.parse(chunk), null);
            } else {
                dbhelper.processData(chunk, function (err, data) {
                    if (err) throw err;
                    callback(null, data);
                });
            }
        });

        res.on('error', function (err) {
            console.log("error:" + err);
        });
    });

    req.end();

    req.on('error', function (e) {
        console.log("reqerror:" + e);
        callback(e, null);
    });
};


module.exports.getAPIProductData = getProductData;