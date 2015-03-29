var mongoose = require('mongoose');

// Product schema
var productSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		index: true
	},
	name: String,
	price: Number,
	sku: { 
		type: String,
		required: true
	 },
	total_sold: {
		type: Number,
		required: true
	},
	view_count: Number
});

var Product = mongoose.model('Product', productSchema);

module.exports = Product;