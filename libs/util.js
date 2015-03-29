var dbhelper = require('./dbhelper');
var apihelper = require('./apihelper');

module.exports.makeAPICall = function(callback) {

    // Checking when was the last time db was updated: "lastUpdated"
    // Due to API call limits, we have placed restrictions on number of times
    // API request is made

    /* 
        Decide whether or not to make API call
        If Today's date - lastUpdated >= 1 month 
        then fetch latest data via API request
        else fetch data from db 
    */
    
    dbhelper.checkLastUpdated(function(err, shouldUpdate) {
        if (err) {
            callback(err, null);
        } else {
            if (shouldUpdate) {
                 // Make API Request and update DB
                console.log("Make API Request and update DB");
                apihelper.getAPIProductData(function(err, data) {
                    if (err) throw err;
                    callback(null, data);
                });
            } else {
                // Fetch Data from DB
                console.log("Fetch Data from DB");
                dbhelper.getProductData(function(err, data) {
                    if (err) throw err;
                    callback(null, data);
                });
            }
        }
    });

};

