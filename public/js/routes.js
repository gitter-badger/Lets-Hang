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
				console.log(data);
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
		var logForm = $('#login-form').serialize();
		console.log(logForm);
		$.ajax({
			url: '/login-submit',
			type: 'POST',
			data: loginForm,
			success: function(data){
				console.log(message);
				if(data.status!='succss'){
					$('.container').append('<h3>email or password incorrect</h3>');
				}
				else{
					localStorage.setItem('user',data.user);
					window.location.replace('/main');
				}
			}
		});
	});
});