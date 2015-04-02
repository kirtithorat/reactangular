var dbhelper = require('./dbhelper');
var apihelper = require('./apihelper');
var mongoose = require('mongoose');
var secret = require('../config/secret');

module.exports.makeAPICall = function(callback) {

    // Checking when was the last time db was updated: "lastUpdated"
    // Due to API call limits, we have placed restrictions on number of times
    // API request is made

    /* 
        Decide whether or not to make API call
        If Today's date - lastUpdated >= 6 months(180 days) 
        then fetch latest data via API request
        else fetch data from db 
    */
    console.log("Util: makeAPICall");
    mongoose.connect(secret.mongodb.url);
    var db = mongoose.connection;
    
    db.on('error', console.error.bind(console, 'connection error....'));
    db.once('open', function () {
        console.log("DB opened");
        dbhelper.checkLastUpdated(function(err, shouldUpdate) {
            if (err) {
                callback(err, null);
            } else {
                if (shouldUpdate) {
                     // Make API Request and update DB
                    console.log("Make API Request and update DB");
                    apihelper.getAPIProductData(function(err, data) {
                        db.close();
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, data);
                        }
                    });
                } else {
                    // Fetch Data from DB
                    console.log("Fetch Data from DB");
                    dbhelper.getProductData(function(err, data) {
                        db.close();
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, data);
                        }
                    });
                }
            }
        });
    });

};

