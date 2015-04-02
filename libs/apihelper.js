var https = require('https');
var fs = require('fs');
var secret = require('../config/secret');
var dbhelper = require('./dbhelper');

var getOptions = function (path) {
    // Getting http options from config/secret.js whose format is as below:
    /*
   {
        'bcAuth': {
            'host': 'www.example.com',
            'username': 'your_username',
            'password': 'your_password',
            'productsPath': '...', // Api Path to get products
            'productCountPath': '...', // Api Path to get products count
            'caPath': '...' // ca bundle path
        },
        'mongodb': {
            'url': '...' // mongodb url
        }
    }; 
    */
    console.log("APIHelper: getOptions");
    var options = {
        hostname: secret.bcAuth.host, // use with www. (in case of sub-domain don't use www.)
        path: path,
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

var getProductCount = function (options, callback) {
    console.log("APIHelper: getProductCount");
    var productCount = 0;
    var productCountReq = https.request(options, function (productCountRes) {
        // console.log("statusCode: ", productCountRes.statusCode);
        // console.log("headers: ", productCountRes.headers);

        var chunk = '';
        productCountRes.on('data', function (data) {
            chunk += data;
        });

        productCountRes.on('end', function () {
            chunk = JSON.parse(chunk);
            if (productCountRes.statusCode !== 200) {
                callback(chunk, null);
            } else {
                /* Example JSON
                    {
                      "count": 44
                    }
                */
                productCount = chunk.count;
                callback(null, productCount);
            }
        });

        productCountRes.on('error', function (err) {
            console.log("error:" + err);
            callback(err, null);
        });
    });

    productCountReq.end();

    productCountReq.on('error', function (err) {
        console.log("reqerror:" + err);
        callback(err, null);
    });

};

var getInsertBatchProducts = function (numOfCalls, options, callback) {
    // As each call can max fetch 250 products, lets calculate no. of calls to be made
    console.log("APIHelper: getInsertBatchProducts");
    // Empty products table as its stale i.e. over 180 days
    // NOTE: Not merging the records here as they are stale, using mongodb native javascript driver to drop collection 
    dbhelper.removeStaleData(function (err) {
        if (err) {
            callback(err, null);
        } else {
            // Make Batch Requests and process Data returned
            var pageCount = 0;
            var path = options.path;
            while (numOfCalls > 0) {
                pageCount++;
                options.path = path + "page=" + pageCount;
                console.log("getBatchProducts: pageCount: "+pageCount);
                https.request(options, function (res) {
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
                                console.log("getBatchProducts: pageCount: processData:"+pageCount);
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null);
                                }
                            });
                        }
                    });

                    res.on('error', function (err) {
                        console.log("error:" + err);
                    });
                }).end();

                // req.on('error', function (e) {
                //     console.log("reqerror:" + e);
                //     callback(e, null);
                // });

                numOfCalls--;

            }
        }

    });

};

var getAPIProductData = function (callback) {
    console.log("APIHelper: getAPIProductData");
    // make API Request
    /*
        In the API that I am using, parameters can be added to the URL query string to paginate the collection. 
        The maximum limit is 250. If a limit isn’t provided, up to 50 products are returned by default.
        So, we will first get the total product count and after that fire multiple http requests to bring all the products
        in batches.
    */
    // Get Request Options for Product Count
    var options = getOptions(secret.bcAuth.productCountPath);
    var productCount = 0;

    getProductCount(options, function(err, count) {
        if (err) {
            callback(err, null);
        } else {
            productCount = count;
            if(productCount > 0) {
                // Get Products in batches
                options = getOptions(secret.bcAuth.productsPath);
                var numOfCalls = Math.ceil(productCount / 250);
                var numberOfResponses = 0;
                getInsertBatchProducts(numOfCalls, options, function (err) {
                    numberOfResponses++;
                    if(err) {
                        callback(err, null);
                    } else {
                        console.log("numberOfResponses:"+numberOfResponses);
                        if(numberOfResponses === numOfCalls) {
                            console.log("We got numberOfResponses:"+numberOfResponses);
                            // Update Static Data after all products batches are inserted
                            dbhelper.updateStaticData(function (err) {
                                if(err) {
                                    callback(err);
                                } else {
                                    // Get Products
                                    dbhelper.getProductData(function (err, products) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            callback(null, products);
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            } else {
                callback({code: 404, message: "No Products to display"}, null);
            }
        }
    });
};


module.exports.getAPIProductData = getAPIProductData;