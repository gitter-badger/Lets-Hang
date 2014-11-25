function messageInit(user, title, roomID){
	this.user = user;
	this.title = title;
	this.socket = io('ws://localhost:8080', {'transports': ['websocket']});
	this.socket.emit('join', JSON.stringify({date:new Date(), user: this.user, room: roomID}));
	this.send = function(msg){
		msg = JSON.stringify(msg)
		this.socket.emit('chat', msg);
	};
	this.socket.on('recieve'+roomID, function(mData){
		if(mData.sender!=this.user){
			$('.message-box').append('<p class="reciever">'+msg+'</p>');
		}
	});
}
$(document).ready(function(){
	var messenger = new messageInit(localStorage.getItem('email'), localStorage.getItem('activity'), localStorage.getItem('act-id'));
	$('#send').click(function(e){
		e.preventDefault();
		console.log('send');
		if($('#message-content').val()!==''){
			console.log($('#message-content').val());
			console.log(localStorage.getItem('activity'));
			var actName = localStorage.getItem('activity');
			var msg = {
				sender: messenger.user,
				name: actName,
				content: $('#message-content').val(),
				date: new Date()
			}
			messenger.send(msg);
			$('.message-box').append('<p class="sender">'+$('#message-content').val()+'</p>');
		}
	});
});