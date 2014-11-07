/**
 * YearController
 *
 * @description :: Server-side logic for managing years
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	getAllActivities: function(user){
		var acts = [];
		var send = false;
		Activity.find({creator: user.id}, function(err, cAct){
			if(err){
				return user;
			}
			acts.push(cAct);
			Activity.find({invited: user.id}).exec(function(err, iAct){
				acts.push(iAct);
				for(var i =0; i<acts.length; i++){
					if(acts[i].startDate.getFullYear() > new Date().getFullYear()){
						acts.splice(i, 1);
					}
					if(i == acts.length-1){
						send = true;
					}
				}
				if(send){
					res.json(acts);
				}
				else{
					setTimeout(200);
				}
			});
		});
	}
};

