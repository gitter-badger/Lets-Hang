var mongoose = require('mongoose');

var activitiesSchema = mongoose.Schema({
	lat:Number,
	lng:Number,
	name:String,
	creator:mongoose.Schema.Types.ObjectId,
	startDate:Date,
	endDate:Date,
	startTime:String,
	endTime:String,
	invited:Array
});

module.exports = mongoose.model('activities', activitiesSchema);