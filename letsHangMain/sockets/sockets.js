module.exports = function(io, pub, sub, rStore){
    function sessionController(user){
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
			this.sub.subscribe('chat');
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
			this.sub.subscribe('chat');
		};
		this.unsubscribe = function() {
			this.sub.unsubscribe('chat');
		};
		this.publish = function(message) {
			this.pub.publish('chat', message);
		};
		this.destroyRedis = function() {
			if (this.sub !== null) this.sub.quit();
			if (this.pub !== null) this.pub.quit();
		};
	}

	io.sockets.on('connection', function(socket){
		console.log('socket.io started');
		console.log(socket.prototype);
		console.log(socket.id);
		socket.on('chat', function(msg){
			msg = JSON.parse(msg);
			rStore.get(socket.id, function(err, sessionController){
				if(sessionController === null){
					var newSess = new sessionController(msg.user);
		  		    newSess.rejoin(socket, msg);
				}
				else{
					var reply = JSON.stringify({action: 'message', user: msg.user, msg: msg.msg});
					sessionController.publish(reply);
				}
			});
		});
		socket.on('join', function(data) {
			var msg = JSON.parse(data);
			var sessionController = new SessionController(msg.user);
			rStore.set('sessionController', sessionController);
			sessionController.subscribe(socket);
		});
		socket.on('disconnect', function() { 
			socket.get('sessionController', function(err, sessionController) {
				if (sessionController === null) return;
				sessionController.unsubscribe();
				var leaveMessage = JSON.stringify({action: 'control', user: sessionController.user, msg: ' left the channel' });
				sessionController.publish(leaveMessage);
				sessionController.destroyRedis();
			});
		});
		sub.on('message', function(channel, message){
			socket.emit('inviteIn', message);
		});
		socket.on('textChange', function(data){
			var first; 
			var last;
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