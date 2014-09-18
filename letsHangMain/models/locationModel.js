var mongoose = require('mongoose');

var locationSchema = mongoose.Schema({
	name:String,
	Lat:Number,
	Long:Number,
	user:String
});

module.exports = mongoose.model('Location', locationSchema);