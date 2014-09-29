var search = function(container){
	"use strict";
	if ( search.prototype._singletonInstance ) {
      return search.prototype._singletonInstance;
    }
    search.prototype._singletonInstance = this;
	this.socket = io('http://localhost:8080');
	this.onTextChange = function(target){
		target.onBlur = this.socket.emit('textChange', target.value);
	};
	this.socket.on('users-found', function(data){
		if(document.getElementById('user-cont')){
			var userCont = document.getElementById('user-cont');
			var userList = document.createElement('ul');
			userList.id = 'user-list';
			userList.class = 'user-list';
			userList.name = 'user-list';
			if(data.users){
				for(var i = 0; i<data.users.length; i++){
					var userInd = document.createElement('li');
					var addBtn = document.createElement('button');
					addBtn.class = 'inviteThis btn btn-primary'
					addBtn.innerHTML = '<i class="fa fa-plus"></i>';
					var userName = document.createElement('p');
					userName.innerText = data.Users[i].name+' '+data.Users[i].lastName;
					userInd.innerHTML = userName+addBtn;
					userList.innerHTML+=userInd;
				}
			}
			else{
				userList.innerHTML = '<li>No Users Found</li>';
			}
			userCont.innerHTML = userList;
		}
		else{
			var userCont = document.createElement('div');
			userCont.id = 'user-cont';
			userCont.class = 'user-cont';
			userCont.name = 'user-cont';
			var userList = document.createElement('ul');
			userList.id = 'user-list';
			userList.class = 'user-list';
			userList.name = 'user-list';
			if(data.users){
				for(var i = 0; i<data.users.length; i++){
					var userInd = document.createElement('li');
					var addBtn = document.createElement('button');
					addBtn.class = 'inviteThis btn btn-primary'
					addBtn.innerHTML = '<i class="fa fa-plus"></i>';
					var userName = document.createElement('p');
					userName.innerText = data.Users[i].name+' '+data.Users[i].lastName;
					userInd.innerHTML = userName+addBtn;
					userList.innerHTML+=userInd;
				}
			}
			else{
				userList.innerHTML = '<li>No Users Found</li>';
			}
			userCont.innerHTML = userList;
			container.innerHTML = userCont;
		}
	});
};
$(document).ready(function(){
	var uSearch = new search($('#invModal .modal-dialog .modal-content .modal-body')[0]);
	uSearch.onTextChange($('#user-search-input')[0]);
});
