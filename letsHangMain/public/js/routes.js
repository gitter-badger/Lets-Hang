"use strict";
window.onload = function(){
	if(window.location.pathname!='/main'){
		console.log('email remove');
		localStorage.removeItem('email');
	}
};
$(document).ready(function (){
	$('#login-submit').click(function(e){
		e.preventDefault();
		localStorage.setItem('email', $('#login-email').val());
		$('#login-form').submit();
	});
	$('#regist-submit').click(function(e){
		e.preventDefault();
		if($('#register-password').val()!=$('#register-conf-password').val()){
			$('#register-form').append('<h3>Passwords do not match</h3>');
			return;
		}
		localStorage.setItem('email', $('#register-email').val());
		$('#register-form').submit();
	});
	$('#activities').click(function(e){
		e.preventDefault();
		$('#activities + .hidden-list').toggleClass('unhidden');
		if($('#messages + .hidden-list.unhidden').length>0){
			$('#messages + .hidden-list').toggleClass('unhidden');
		}
		if($('#locations + .hidden-list.unhidden').length>0){
			$('#locations + .hidden-list').toggleClass('unhidden');
		}
	});
	$('#messages').click(function(e){
		e.preventDefault();
		$('#messages + .hidden-list').toggleClass('unhidden');
		if($('#activities + .hidden-list.unhidden').length>0){
			$('#activities + .hidden-list').toggleClass('unhidden');
		}
		if($('#locations + .hidden-list.unhidden').length>0){
			$('#locations + .hidden-list').toggleClass('unhidden');
		}
	});
	$('#locations').click(function(e){
		e.preventDefault();
		$('#locations + .hidden-list').toggleClass('unhidden');
		if($('#activities + .hidden-list.unhidden').length>0){
			$('#activities + .hidden-list').toggleClass('unhidden');
		}
		if($('#messages + .hidden-list.unhidden').length>0){
			$('#messages + .hidden-list').toggleClass('unhidden');
		}
	});
	$('#change-password').click(function(e){
		e.preventDefault();
		localStorage.setItem('settings', $('#settModal .modal-dialog .modal-content .modal-body').html());
		$('#settModal .modal-dialog .modal-content .modal-body').html(
			'<form id="change-pass-form" class="input-group">'+
			'<input id="old-pass" name="old-pass" class="form-control" type="password" placeholder="Old Password"></br>'+
			'<input id="new-pass" name="new-pass" class="form-control" type="password" placeholder="New Password"></br>'+
			'<input id="new-pass-conf" name="new-pass-conf" class="form-control" type="password" placeholder="Confirm New Password"></br>'+
			'<input id="new-pass-btn" name="new-pass-btn" class="btn btn-success" type="button" value="Submit"></br>'+
			'</form>'
		);
	});
	$('#new-pass-btn').on('click', function(e){
		e.preventDefault();
		if($('#new-pass').val()==$('#new-pass-conf').val()){
			$.ajax({
				url:'/change-password',
				type:'PUT',
				data:{
					email: localStorage.getItem('email'),
					newPassword: $('#new-pass').val(),
					oldPassword: $('#old-pass').val()
				},
				success: function(data){
					if(data.message=='success'){
						$('#settModal .modal-dialog .modal-content .modal-body').html(localStorage.getItem('settings'));
						$('#settModal').modal('hide');
						localStorage.removeItem('settings');
					}
					else{
						$('#settModal .modal-dialog .modal-content .modal-body').append('<h4>'+data.message+'</h4>');
					}
				}
			});
		}
		else{
			$('#settModal .modal-dialog .modal-content .modal-body').append('<h4>New Password and Confirmation do not Match</h4>');
		}
	});
	$('#settModal .modal-dialog .modal-content .modal-footer #close, #settModal .modal-dialog .modal-content .modal-header .close').click(function(){
		var settHTML = localStorage.getItem('settings');
		if(settHTML){
			$('#settModal .modal-dialog .modal-content .modal-body').html(settHTML);
		}
	});
	var uSearch = new search(document.getElementById('user-result'));
	document.getElementById('user-search-input').addEventListener('keyup', function(){
		uSearch.onTextChange(document.getElementById('user-search-input'));
		if(document.getElementById('user-search-input').value===''){
			document.getElementById('user-result').innerHTML='';
		}
	},false);
	$('#activities + .hidden-list li').click(function(e){
		e.preventDefault();
		var id = e.target.dataset.actId;
		$('#aboutModal').modal('show');
		$('#aboutModal .modal-dialog .modal-content').html('&nbsp;').load('/main/aboutEvent/'+id);
	});
	$('#activities + .hidden-list li *').click(function(e){
		$('.hidden-list li').click();
	});
	$('#locations + .hidden-list li').click(function(e){
		document.getElementById('newActLoct').value = this.innerText;
	});
	$()
});
function edit(event){
	var e = event;
	e.preventDefault();
	console.log('click');
	var parent = $(e.target).parent();
	console.log(parent[0]);
	if($('#check').length>0){
		$('#check').parent().html(JSON.parse(localStorage.getItem('edit-html')).html);	
	}
	console.log({html: parent[0].outerHTML});
	localStorage.setItem('edit-html', JSON.stringify({html: parent[0].outerHTML}));
	var contentString = '';
	if(e.target.id.indexOf('date')>-1){
		contentString = '<input type="date" name="newDate" id="'+e.target.id+'-input" class="form-control" value="'+parent[0].dataset.date+'"></br>'+
						'<button id="check" class="glyphicon glyphicon-ok" onclick="timeSub(event)"></button>'+
						'<button id="nope" class="glyphicon glyphicon-remove" onclick="restoreAttr(event)"></button>';
	}
	else{
		contentString = '<input type="time" name="newTime" id="'+e.target.id+'-input" class="form-control" value="'+parent[0].dataset.time+'"></br>'+
						'<button id="check" class="glyphicon glyphicon-ok" onclick="timeSub(event)"></button>'+
						'<button id="nope" class="glyphicon glyphicon-remove" onclick="restoreAttr(event)"></button>';
	}
	parent.html(contentString);
}
function showOnMap(event){
	event.preventDefault();
	console.log('clicky clack');
	var act = {
		lat: document.getElementById('evt-title').dataset.lat,
		lng: document.getElementById('evt-title').dataset.lng,
		name: document.getElementById('evt-title').innerText
	};
	mapNewActivity(act);
	$('#aboutModal').modal('hide');
}
function clockRender(){
	if($('#startTime[type^=text]')){
		$('#startTime[type^=text]').parent().addClass('clockpicker');
	}
	if($('#addEnd[type^=text]')){
		$('#addEnd[type^=text]').parent().addClass('clockpicker');
	}
	$('.clockpicker').clockpicker();
}
clockRender();
