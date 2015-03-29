var mongoose = require('mongoose');

var staticDataSchema = new mongoose.Schema({
	dataKey: {
		type: String,
		required: true,
		unique: true
	},
	dataValue: {
		type: Date,
		required: true
	}
});

var StaticData = mongoose.model('StaticData', staticDataSchema);

module.exports = StaticData;