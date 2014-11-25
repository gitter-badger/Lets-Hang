var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
	sender:mongoose.Schema.Types.ObjectId,
	content:String,
	activity:mongoose.Schema.Types.ObjectId,
	receivers:Array,
	sendDate:Date
});

module.exports = mongoose.model('messages', messageSchema);