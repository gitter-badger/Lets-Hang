var sessID = 0 ;
module.exports = function(io, pub, sub, rStore){
    var sessionController = function(user){
		this.sub = sub;
		this.pub = pub;
		this.user = user;
		this.subscribe = function(socket) {
			this.sub.on('message', function(channel, message) {
				socket.emit('recieve'+channel, message);
			});
			var current = this;
			this.sub.on('subscribe', function(channel, count) {
				var joinMessage = JSON.stringify({action: 'control', user: current.user, msg: ' joined the channel' });
				current.publish(joinMessage);
			});
			rStore.get('room', function(err, room){
				console.log('before');
				current.sub.subscribe('chat-'+room);
				console.log('sub');				
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
				current.sub.subscribe('chat'+room);
			});
		};
		this.unsubscribe = function() {
			var current = this;
			rStore.get('room', function(err, room){
				current.sub.unsubscribe('chat'+room);
			});
		};
		this.publish = function(message) {
			var current = this;
			rStore.get('room', function(err, room){
				current.pub.publish('chat'+room, message);
			});
		};
		this.destroyRedis = function() {
			if (this.sub !== null) this.sub.quit();
			if (this.pub !== null) this.pub.quit();
		};
	};

	var inviteController = function(user){
		sessionController.call(this, user);
		this.subscribe = function(socket){
			this.sub.on('message', function(channel, message) {
				if(channel.indexOf('ID: ')){
					socket.emit(channel, message);
				}
			});
			this.sub.subscribe('ID: '+user);
		};
	};

	io.sockets.on('connection', function(socket){
		console.log('socket.io started');
		var sessionCtrlr;
		var inviteCtrlr;
		socket.on('join', function(data) {
			var msg = JSON.parse(data);
			socket.join(msg.room);
			sessionCtrlr = new sessionController(msg.user);
			rStore.set('room', msg.room);
			sessionCtrlr.subscribe(msg.room);
			console.log('join');
		});
		rStore.get('inviteQue', function(err, que){
			if(que===null) return;
			que = JSON.parse(que);
			for(var i = 0; i<que.length; i++){
				if(inviteCtrlr===null){
					inviteCtrlr = new inviteController(que[0].user);
				}
				inviteCtrlr.publish(que[i]);
			}
		});
		rStore.get('room', function(err, room){
			socket.on('chat'+room, function(msg){
				msg = JSON.parse(msg);
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
			socket.on('disconnect', function() { 
				if (room === null || !sessionCtrlr){
					return;	
				} 
				var leaveMessage = JSON.stringify({action: 'control', user: sessionCtrlr.user, msg: ' left the channel' });
				sessionCtrlr.publish(leaveMessage);
				sessionCtrlr.unsubscribe();
				sessionCtrlr.destroyRedis();
			});
		});
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
	});
};
