var express = require('express');
var router = express.Router();

var util = require('../libs/util');
var path = require('path');

router.route('/api')
    .get(function(request, response) {
        console.log("Route Request");

        // API Request to fetch JSON data using Basic Auth
        util.makeAPICall(function (err, data) {
          if(err) { 
            response.send(err); 
          }
          else {
            response.send(data);
            //response.sendFile(path.join(__dirname, '../public/index.html')); 
          }
        });

    });

module.exports = router;
