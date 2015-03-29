var mongoose = require('mongoose');
var Product = require('../models/Product');
var StaticData = require('../models/StaticData');
var secret = require('../config/secret');
// Connect to the MongoDB



var processData = function (data, callback) {
	console.log("processData");
    // process the data returned from API call: store it in mongodb
	var products = JSON.parse(data);
	mongoose.connect(secret.mongodb.url);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error....'));

	db.once('open', function () {
		// Empty products table as its stale i.e. over 30 days
		// NOTE: Not merging the records here as they are stale, using mongodb native javascript driver to drop collection 
		db.collections['products'].drop(function (err, result) {
			if(err) {
				callback(err, null);
			} else { 

		        // Bulk insert products then update lastUpdated
				Product.create(products, function(err, docs) {			
					if(err){
						callback(err, null);	
					} else {
						console.log('%d products were created', docs.length);				
						StaticData.findOneAndUpdate({dataKey: 'lastUpdatedOn'}, {dataValue: new Date()}, {upsert: true}, function(err, doc) {
							db.close();
							if(err) {
								callback(err, null);
							} 
							else {
								getProductData(function(err, products) {					
									if(err) {
										callback(err, null);
									} else {
										callback(null, products);
									}
								});									
							}	

						});			
					}
				});
			}
		});
	});
};

var getProductData = function (callback) {
	console.log("DB: getProductData");
	mongoose.connect(secret.mongodb.url);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error....'));

	db.once('open', function () {
		Product.find({}).sort({'total_sold': 'desc'}).limit(5).exec(function(err, docs) {
			db.close();
			if(err){
				callback(err, null);	
			} else {
				callback(null, docs)
			}
		});
		
	});	
};

var checkLastUpdated = function (callback) {
	console.log("checkLastUpdated");
	mongoose.connect(secret.mongodb.url);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error....'));

	db.once('open', function () {
		console.log("db open");
		StaticData.findOne({dataKey: 'lastUpdatedOn'}, function(err, doc) {
			console.log("findOne doc:"+doc);
			console.log("findOne error:"+err);
			db.close();
			if(err){
				callback(err, null);	
			} else {
				if(doc && doc.dataValue) {
					var lastUpdatedOn = doc.dataValue;
					var nextUpdateDate = new Date();
					nextUpdateDate.setDate(lastUpdatedOn.getDate() + 30);
					var todaysDate = new Date();

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
	});
};


module.exports.processData = processData;
module.exports.getProductData = getProductData;
module.exports.checkLastUpdated = checkLastUpdated;