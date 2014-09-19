var mongoose = require('mongoose');

var locationSchema = mongoose.Schema({
	name:String,
	Lat:Number,
	Long:Number,
	user:mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Location', locationSchema);