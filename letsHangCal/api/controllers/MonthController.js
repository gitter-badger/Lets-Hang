/**
 * MonthController
 *
 * @description :: Server-side logic for managing months
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getAllActivities: function(user, month){
		var acts = [];
		var send = false;
		Activity.find({creator: user.id}).exec(function(err, cAct){
			if(err){
				return err;
			}
			acts.push(cActs);
			Activity.find({invited: user.id}).exec(function(err, iAct){
				acts.push(iActs);
				for(var i = 0; i<acts.length; i++){
					if(acts[i].startDate.getMonth()!=month){
						acts.splice(i, 1);
					}
				}
				send = true;
			});
		});
		while(!send){}
		return acts;
	}
};

