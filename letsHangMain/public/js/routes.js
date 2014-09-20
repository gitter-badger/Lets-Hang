"use strict";
window.onload = function(){
	if(window.location.pathname=='/'){
		console.log('email remove');
		localStorage.removeItem('email');
	}
};
$(document).ready(function (){
	$('#login-home').click(function (){
		window.location.replace('/login');
	});
	$('#register-home').click(function (){
		window.location.replace('/register');
	});
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
});
