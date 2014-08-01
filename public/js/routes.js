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
		var logForm = {
			emailAddr: $('#login-email').val(),
			password: $('#login-password').val()
		};
		alert('click');
		alert(logForm)
		console.log(logForm);
		$.ajax({
			url: '/login-submit',
			type: 'POST',
			data: logForm,
			success: function(data){
				console.log(data);
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
	console.log(localStorage.getItem('user'));
	if($('#activities').length>0){
		$.ajax({
			url: '/main/activities',
			type: 'GET',
			data: {name: localStorage.getItem('user')},
			success: function(data){
				console.log(JSON.stringify(data));
				console.log(data[0].name);
				if(data!==null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						console.log(listNode);
						listNode[0].innerHTML=data[i].name;
						console.log(listNode[0].innerHTML);
						console.log(listNode[0].outerHTML);
						$('#activities + .hidden-list').append(listNode[0].outerHTML);
						console.log($('#activities + .hidden-list')[0].outerHTML);
					}
				}
			}
		});
		$('#activities').click(function(e){
			e.preventDefault();
			$('#activities + .hidden-list').toggleClass('unhidden');
		});
	}
	if($('#messages').length>0){
		$.ajax({
			url: '/main/messages',
			type: 'GET',
			data: {sender: localStorage.getItem('user')},
			succes: function(data){
				console.log(JSON.stringify(data));
				if(data!==null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						var contain = $('<ul></ul>');
						var content = $('<li></li>');
						content[0].innerHTML = data[i].activity;
						contain[0].innerHTML = content[0].outerHTML;
						listNode[0].innerHTML = contain[0].outerHTML;
						$('#messages + .hidden-list').append(listNode[0].outerHTML);
						console.log($('#messages + .hidden-list')[0].outerHTML);
					}
				}
			}
		});
		$('#messages').click(function(e){
			e.preventDefault();
			$('#messages + .hidden-list').toggleClass('unhidden');
		});
	}
	if($('#locations').length>0){
		$.ajax({
			url: '/main/locations',
			type: 'GET',
			data: {user:localStorage.getItem('user')},
			success: function(data){
				console.log(JSON.stringify(data));
				if(data!=null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						var contain = $('<ul></ul>');
						var content = $('<li></li>');
						content[0].innerHTML = data[i].invited;
						contain[0].innerHTML = content[0].outerHTML;
						listNode[0].innerHTML = data[i].name+contain[0].outerHTML;
						$('#locations + .hidden-list').append(listNode[0].outerHTML);
						console.log($('#locations + .hidden-list')[0].outerHTML);
					}
				}
			}
		});
		$('#locations').click(function(e){
			e.preventDefault();
			$('#locations + .hidden-list').toggleClass('unhidden');
		});
	}
});