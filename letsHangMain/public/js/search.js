var search = function(container){
	"use strict";
	if ( search.prototype._singletonInstance ) {
      return search.prototype._singletonInstance;
    }
    search.prototype._singletonInstance = this;
	this.socket = io('http://localhost:8080', {'transports': ['websocket', 'polling']});
	this.onTextChange = function(target){
		console.log('keypress');
		this.socket.emit('textChange', target.value);
	};
	this.socket.on('users-found', function(data){
		console.log(data);
		if(document.getElementById('user-cont')){
			var userCont = document.getElementById('user-cont');
			var userList = document.createElement('ul');
			userList.id = 'user-list';
			userList.className = 'user-list';
			userList.name = 'user-list';
			if(data.users){
				console.log(data.users[0].local.name);
				for(var i = 0; i<data.users.length; i++){
					var userInd = document.createElement('li');
					var addBtn = document.createElement('button');
					addBtn.dataset.id = data.users[i]._id; 
					addBtn.className = 'inviteThis btn btn-primary';
					addBtn.innerHTML = '<i class="fa fa-plus"></i>';
					var userName = document.createElement('p');
					userName.innerText = data.users[i].local.name+' '+data.users[i].local.lastName;
					userInd.innerHTML = userName.outerHTML+addBtn.outerHTML;
					userList.innerHTML+=userInd.outerHTML;
				}
			}
			else{
				userList.innerHTML = '<li>No Users Found</li>';
			}
			userCont.innerHTML = userList.outerHTML;
		}
		else{
			var userCont = document.createElement('div');
			userCont.id = 'user-cont';
			userCont.className = 'user-cont';
			userCont.name = 'user-cont';
			var userList = document.createElement('ul');
			userList.id = 'user-list';
			userList.className = 'user-list';
			userList.name = 'user-list';
			if(data.users){
				console.log(data.users[0].local.name);
				for(var i = 0; i<data.users.length; i++){
					var userInd = document.createElement('li');
					var addBtn = document.createElement('button');
					addBtn.dataset.id = data.users[i]._id;
					addBtn.className = 'inviteThis btn btn-primary';
					addBtn.innerHTML = '<i class="fa fa-plus"></i>';
					var userName = document.createElement('p');
					userName.innerText = data.users[i].local.name+' '+data.users[i].local.lastName;
					userInd.innerHTML = userName.outerHTML+addBtn.outerHTML;
					userList.innerHTML+=userInd.outerHTML;
				}
			}
			else{
				userList.innerHTML = '<li>No Users Found</li>';
			}
			userCont.innerHTML = userList.outerHTML;
			container.innerHTML += userCont.outerHTML;
		}
		addToInvList();
	});
};
