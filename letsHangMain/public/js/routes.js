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
});
