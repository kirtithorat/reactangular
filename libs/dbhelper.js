var mongoose = require('mongoose');
var Product = require('../models/Product');
var StaticData = require('../models/StaticData');
var secret = require('../config/secret');

var removeStaleData = function (callback) {
	console.log("DBHelper: removeStaleData");
	var db = mongoose.connection;
	// To use native mongodb method, we used mongoose connection instance here
	db.collections['products'].drop(function (err, result) {
		if(err) {
			callback(err);
		} else { 
			callback(null);
		}
	});
};

var processData = function (data, callback) {
    console.log("DBHelper: processData");
    // process the data returned from API call: store it in mongodb
    var products = JSON.parse(data);
    // Bulk insert products then update lastUpdated
    Product.create(products, function (err, docs) {
        if (err) {
            callback(err, null);
        } else {
            console.log('%d products were created', docs.length);
            callback(null);
        }
    });
};

var updateStaticData = function (callback) {
	console.log("DBHelper: updateStaticData");
	StaticData.findOneAndUpdate({dataKey: 'lastUpdatedOn'}, {dataValue: new Date()}, {upsert: true}, function (err, doc) {
        if (err) {
            callback(err);
        } else {
        	callback(null);
        }
    });
};

var getProductData = function (callback) {
	console.log("DBHelper: getProductData");
	Product.find({}).sort({'total_sold': 'desc'}).limit(5).exec(function(err, docs) {
		if(err){
			callback(err, null);	
		} else {
			callback(null, docs)
		}
	});
};

var addDays = function (theDate, days) {
	console.log("DBHelper: addDays");
    return new Date(theDate.getTime() + days*24*60*60*1000);
}

var checkLastUpdated = function (callback) {
	console.log("DBHelper: checkLastUpdated");
	StaticData.findOne({dataKey: 'lastUpdatedOn'}, function(err, doc) {
		console.log("findOne doc:"+doc);
		console.log("findOne error:"+err);
		if(err){
			callback(err, null);	
		} else {
			if(doc && doc.dataValue) {
				var lastUpdatedOn = doc.dataValue;
				var nextUpdateDate = addDays(lastUpdatedOn, -1);
				var todaysDate = new Date();
				console.log("Todays Date:"+todaysDate+"  nextUpdateDate: "+nextUpdateDate+"  lastUpdatedOn:"+lastUpdatedOn);
				if (todaysDate < nextUpdateDate) {
					callback(null, false);
				} else {
					callback(null, true);
				}
			} else {
				callback(null, true);
			}
		}
	});
};


module.exports.processData = processData;
module.exports.getProductData = getProductData;
module.exports.checkLastUpdated = checkLastUpdated;
module.exports.removeStaleData = removeStaleData;
module.exports.updateStaticData = updateStaticData;