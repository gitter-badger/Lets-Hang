var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
	sender:Objectid,
	content:String,
	activity:Objectid,
	receivers:Array,
	sendDate:Date
});

module.exports = mongoose.model('message', messageSchema);