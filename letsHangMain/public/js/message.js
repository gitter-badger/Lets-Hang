"use strict";
function messageInit(target, user, title){
	this.user = user;
	this.targetUsers = target;
	this.title = title;
	this.socket = io();
	this.allUsers = function(){
		this.targetUsers[this.targetUsers.length]=this.user;
		return this.targetUsers;
	}
	this.socket.emit('messageInit', {date:new Date(), users: this.allUsers});
	this.send.prototype = function(msg){
		this.socket.emit('send', msg);
	}
	this.socket.on('recieve', function(msg){
		$('.'+this.title).append('<p>'+msg+'</p>');
	});
}
function inviteIn(user){
	this.user = user;
	this.socket = io();
	this.socket.on('findUser', function(data){
		if(this.user!==null){
			socket.emit('foundUser', this.user);
		}
	});
	this.socket.on('inviteIn', function(inv){
		console.log('invited');
		console.log(inv);
	});
}

$(document).ready(function(){
	var inviteLine = new inviteIn(localStorage.getItem('user'));
	$('#new-message').click(function(){
		$(body).append('<div class="modal fade" id="messageModal" tabindex="-1" role="dialog" aria-labelledby="messageModalLabel" aria-hidden="true">'
      		+'<div class="modal-dialog">'
        	+'<div class="modal-content">'
          	+'<div class="modal-header">'
            +'<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
            +'<h4 class="modal-title">Which Activity to Chat About?</h4>'
          	+'</div>'
          	+'<div class="modal-body">'
          	+'<select>'
          	+'<option>'
          	+'</option>'
          	+'</select>'
          	+'</div>'
          	+'<div class="modal-footer">'
            +'<button type="button" id="close" class="btn btn-default" data-dismiss="modal">Close</button>'
            +'<button type="button" id="save" class="btn btn-primary">Save changes</button>'
          	+'</div>'
        	+'</div><!-- /.modal-content -->'
      		+'</div><!-- /.modal-dialog -->'
    		+'</div>');
		var newMessageRoom = new messageInit()
	});
});