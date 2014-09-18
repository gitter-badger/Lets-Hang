"use strict";
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
		localStorage.setItem('email', $('#register-email').val());
		$('#register-form').submit();
	});
	$.ajax({
		url: '/main',
		type: 'GET',
		data: {email: localStorage.getItem('email')},
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
		localStorage.setItem('email',null);
		window.location.replace('/');
	});
});
