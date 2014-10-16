$('body').ready(function(){
	function inviteIn(user){
		this.user = user;
		this.socket = io('ws://localhost:8080', {'transports': ['websocket']});
		this.socket.on('findUser', function(data){
			if(this.user!==null){
				this.socket.emit('foundUser', this.user);
			}
		});
		this.socket.on('inviteIn', function(inv){
			console.log('invited');
			console.log(inv);
		});
	}
	//var inviteLine = new inviteIn(localStorage.getItem('user'));
	$('#new-message').click(function(e){
		function activitySelect(){
			var result;
			var lParent = $('#activities + .hidden-list').children();
			for(var i = 0; i<lParent.length; i++){
				result += '<option value="'+lParent[i].innerText+'">'+lParent[i].innerText+'</option>';
			}
			return result;
		}
		var modal = $('<div class="modal fade" id="messModal">'+
            '<div class="modal-dialog">'+
            '<div class="modal-content">'+
            '<div class="modal-header">'+
            '<button type="button" class="close" data-dismiss="modal">'+
            '<span aria-hidden="true">&times;</span>'+
            '<span class="sr-only">Close</span>'+
            '</button>'+
            '<h4 class="modal-title">Create New Group Message</h4>'+
            '</div>'+
            '<div class="modal-body">'+
            '<select id="chat-act-select">'+
            '<option selected="selected" value="Select Which Activity To Chat About">'+
            activitySelect()+
            '</select>'+
            '</div>'+
            '<div class="modal-footer">'+
            '<button type="button" id="close" class="btn btn-default" data-dismiss="modal">Close</button>'+
            '<button type="button" id="startChat" class="btn btn-primary">Start Chat</button>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>');
		$('body').append(modal[0]);
		modal.modal('show');
	});
	$('body').on('click mousedown touchstart pointerDown','#startChat' , function(e){
		e.preventDefault();
		e.stopPropagation();
		console.log('click');
		$.ajax({
			url:'/main/create-message',
			type:'POST',
			data: {
				name: $('#chat-act-select option:selected').val(),
				user: localStorage.getItem('email')
			},
			success: function(data){
				var chatBox = $('<div class="chat-box">'+
					'<div class="chat-title">'+
					'<h4>'+
					data.name+
					'</h4>'+
					'<button class="btn btn-link">&times;</button>'+
					'</div>'+
					'<div id="message-holder">'+
					'<iframe src="/message" height="200px" width="185px"></iframe>'+
					'</div>'+
					'</div>');
				if(typeof $('div.chat-box')[0]!="object"){
					console.log(typeof $('div.chat-box')[0]);
					$('body').append(chatBox[0]);
					localStorage.setItem('activity', data.name);
					$('#messModal').modal('hide');
				}
				else{
					$('#messModal').append('<p>Chat for That activity is already open');
				}
			}
		});
	});
	$('body').on('click mousedown touchstart pointerDown', '.chat-title .btn.btn-link', function(e){
		e.preventDefault();
		e.stopPropagation();
		console.log('exit');
		console.log(e.target);
		var chatBox = $(e.target).parent().parent();
		console.log(chatBox);
		var iFrame = chatBox.children('.message-holder iframe');
		console.log(chatBox.children('.message-holder iframe'));
		iFrame.src='about:blank';
		console.log(iFrame);
		chatBox.remove();
	});
});