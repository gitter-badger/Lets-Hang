function messageInit(user, title){
	this.user = user;
	this.title = title;
	this.socket = io('http://localhost:8080');
	this.socket.emit('messageInit', {date:new Date(), users: this.allUsers});
	this.send = function(msg){
		this.socket.emit('send', msg);
	};
	this.socket.on('recieve', function(mData){
		if(mData.sender!=this.user){
			$('.message-box').append('<p class="reciever">'+msg+'</p>');
		}
	});
}
$(document).ready(function(){
	var messenger = new messageInit(localStorage.getItem('email'), localStorage.getItem('activity'));
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