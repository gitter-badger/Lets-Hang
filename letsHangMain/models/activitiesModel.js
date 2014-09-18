var mongoose = require('mongoose');

var activitiesSchema = mongoose.Schema({
	lat:Number,
	lng:Number,
	name:String,
	creator:Objectid,
	startDate:Date,
	endDate:Date,
	startTime:String,
	endTime:String,
	invited:Array
});

module.exports = mongoose.model('activity', activitiesSchema);