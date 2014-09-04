"use strict";
$(document).ready(function (){
	$('#login-home').click(function (){
		window.location.replace('/login');
	});
	$('#register-home').click(function (){
		window.location.replace('/register');
	});
	$('#register-submit').click(function (e){
		e.preventDefault();
		var regForm = $('#register-form').serialize();
		console.log(regForm);
		$.ajax({
			url: '/register-submit',
			type: 'POST',
			data: regForm,
			success: function(data){
				if(data.status!='success'){
					$('.container').append('<h3>account already exists</h3>');
				}
				else{
					localStorage.setItem('user',data.newUser);
					window.location.replace('/main');
				}
			}
		});
	});
	$('#login-submit').click(function (e){
		e.preventDefault();
		var logForm = {
			emailAddr: $('#login-email').val(),
			password: $('#login-password').val()
		};
		console.log(logForm);
		$.ajax({
			url: '/login-submit',
			type: 'POST',
			data: logForm,
			success: function(data){
				if(data.status!='success'){
					$('.container').append('<h3>email or password incorrect</h3>');
				}
				else{
					localStorage.setItem('user',data.newUser);
					window.location.replace('/main');
				}
			}
		});
	});
	$.ajax({
		url: '/main',
		type: 'GET',
		data: {user: localStorage.getItem('user')},
		success: function(data){}
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
	/*$('#messages + .hidden-list li').click(function(e){
			messageInit(e.target, localStorage.getItem('user'));
	});*/
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
	$('#logout').click(function(e){
		localStorage.setItem('user',null);
		window.location.replace('/');
	});
});
