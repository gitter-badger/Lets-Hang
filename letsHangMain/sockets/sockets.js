var sessID = 0 ;
module.exports = function(io, pub, sub, rStore){
    var sessionController = function(user){
		this.sub = sub;
		this.pub = pub;
		this.user = user;
		this.subscribe = function(socket) {
			this.sub.on('message', function(channel, message) {
				socket.emit(channel, message);
			});
			var current = this;
			this.sub.on('subscribe', function(channel, count) {
				var joinMessage = JSON.stringify({action: 'control', user: current.user, msg: ' joined the channel' });
				current.publish(joinMessage);
			});
			rStore.get('room', function(err, room){
				this.sub.subscribe('chat-'+room);				
			});
		};
		this.rejoin = function(socket, message) {
			this.sub.on('message', function(channel, message) {
				socket.emit(channel, message);
			});
			var current = this;
			this.sub.on('subscribe', function(channel, count) {
				var rejoin = JSON.stringify({action: 'control', user: current.user, msg: ' rejoined the channel' });
				current.publish(rejoin);
				var reply = JSON.stringify({action: 'message', user: message.user, msg: message.msg });
				current.publish(reply);
			});
			rStore.get('room', function(err, room){
				if(err){
					console.log(err);
				}
				this.sub.subscribe('chat'+room);
			});
		};
		this.unsubscribe = function() {
			rStore.get('room', function(err, room){
				this.sub.unsubscribe('chat'+room);
			});
		};
		this.publish = function(message) {
			rStore.get('room', function(err, room){
				this.pub.publish('chat'+room, message);
			});
		};
		this.destroyRedis = function() {
			if (this.sub !== null) this.sub.quit();
			if (this.pub !== null) this.pub.quit();
		};
	}

	var inviteController = function(user){
		sessionController.call(this, user);
		this.subscribe = function(socket){
			this.sub.subscribe('ID: '+user);
		};
		this.logon = function(){
			this.subscribe()
		};
		this.invite = function(){

		};
	}

	io.sockets.on('connection', function(socket){
		console.log('socket.io started');
		var sessionCtrlr;
		socket.on('chat', function(msg){
			msg = JSON.parse(msg);
			rStore.get('room', function(err, room){
				if(room === null){
					sessionCtrlr = new sessionController(msg.user);
		  		    sessionCtrlr.rejoin(socket, msg);
				}
				else{
					console.log(sessionCtrlr.user);
					var reply = JSON.stringify({action: 'message', user: msg.sender, msg: msg.content});
					sessionCtrlr.publish(reply);
				}
			});
		});
		socket.on('join', function(data) {
			var msg = JSON.parse(data);
			socket.join(msg.room);
			sessionCtrlr = new sessionController(msg.user);
			rStore.set('room', msg.room);
			sessionCtrlr.subscribe(msg.room);
		});
		socket.on('disconnect', function() { 
			rStore.get('room', function(err, room) {
				if (room === null) return;
				sessionCtrlr.unsubscribe();
				var leaveMessage = JSON.stringify({action: 'control', user: sessionCtrlr.user, msg: ' left the channel' });
				sessionCtrlr.publish(leaveMessage);
				sessionCtrlr.destroyRedis();
			});
		});
		/* sub.on('message', function(channel, message){
			socket.emit('inviteIn', message);
		}); */
		socket.on('textChange', function(data){
			var first; 
			var last;
			var User = require('../models/user');
			if(data.indexOf(' ')>-1){
				first = data.substring(0, data.indexOf(' '));
				last = data.substring(data.indexOf(' ')+1);
				first.replace(' ','');
				last.replace(' ','');
			}
			else{
				first = data;
				last = null;
				first.replace(' ','');
			}
			User.find({},function(err, users){
				if(err){
					console.log(err);
				}
				if(users){
					var result = [];
					rStore.get('sUserID', function(err, reply){
						for(var i = 0; i<users.length; i++){
							if(users[i].id!=reply){
								if(first){
									if(last){
										if(users[i].local.name.indexOf(first)>-1&&users[i].local.lastName.indexOf(last)>-1){
											result.push(users[i]);
											socket.emit('users-found', {users: result});
										}
									}
									else if(users[i].local.name.indexOf(first)>-1){
										result.push(users[i]);
										socket.emit('users-found', {users: result});
									}
								}
							}
						}
					});
				}
				else{
					socket.emit('users-found', {});
     			}
    		});
		});
		socket.on('send', function(msg){
			User.find({'local.email': msg.sender}, function(err, user){
				activities.findOne({name: msg.name, creator:user.id}, function(err, act){
					if(err){
						console.log(err);
					}
					if(act){
						var mess = new messages();
						mess.sender = user.id;
						mess.content = msg.content;
						mess.activity = act.id;
						mess.receiver = act.invited;
						mess.sendDate = new Date();
						mess.save(function(err){
							if(err){
								console.log(err);
							}
						});
						pub.publish(act.id, user.name+'is chatting, '+msg.content+', on'+msg.date);
						socket.broadcast.emit('recieve',msg);
					}
					else{
						activities.findOne({name: msg.name, invited: [user.id]}, function(err, act){
							if(err){
								console.log(err);
								return;
							}
							if(act===null){
								console.log('query not found');
								return;
							}
							var mess = new messages();
							mess.sender = user.id;
							mess.content = msg.content;
							mess.activity = act.id;
							mess.receiver = act.invited.push(act.creator);
							mess.sendDate = new Date();
							mess.save(function(err){
								if(err){
									console.log(err);
								}
							});
						});
						socket.broadcast.emit('recieve',msg);
					}
				});
			});
		});
	});
};