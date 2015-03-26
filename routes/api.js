var express = require('express');
var router = express.Router();

var https = require('https');
var path = require('path');
var fs = require('fs');

var secret = require('../config/secret');

router.route('/api')
    .get(function(request, response) {
      console.log("Making API Request");
        // API Request using Basic Auth
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
       
       var req = https.request(options, function(res) {
           console.log("statusCode: ", res.statusCode);
           console.log("headers: ", res.headers);
           var chunk = '';
           res.on('data', function(d) {
                chunk += d;
           });
       
          res.on('end', function (){
            response.send(JSON.parse(chunk));
          });
       });
       req.end();
       
       req.on('error', function(e) {
           console.error(e);
       });


    });

module.exports = router;
