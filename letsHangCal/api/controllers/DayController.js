/**
 * DayController
 *
 * @description :: Server-side logic for managing days
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getAllActivities: function(req, res){
		var acts = [];
		var send = false;
		Activity.find({creator: req.user.id}).exec(function(err, cActs){
			if(err){
				return err;
			}
		});
	}
};

