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
		alert('click');
		alert(logForm)
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
	if($('#activities').length>0){
		$.ajax({
			url: '/main/activities',
			type: 'GET',
			data: {name: localStorage.getItem('user')},
			success: function(data){
				if(data!==null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						listNode[0].innerHTML=data[i].name;
						$('#activities + .hidden-list').append(listNode[0].outerHTML);
					}
				}
			}
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
	}
	if($('#messages').length>0){
		$.ajax({
			url: '/main/messages',
			type: 'GET',
			data: {sender: localStorage.getItem('user')},
			success: function(data){
				if(data!==null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						var contain = $('<ul></ul>');
						var content = $('<li></li>');
						content[0].innerHTML = data[i].content;
						contain[0].innerHTML = content[0].outerHTML;
						listNode[0].innerHTML = data[i].activity + contain[0].outerHTML;
						$('#messages + .hidden-list').append(listNode[0].outerHTML);
					}
				}
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
		$('#messages + .hidden-list li').click(function(e){
			messageInit(e.target, localStorage.getItem('user'));
		});
	}
	if($('#locations').length>0){
		$.ajax({
			url: '/main/locations',
			type: 'GET',
			data: {user:localStorage.getItem('user')},
			success: function(data){
				if(data!=null){
					for(var i=0; i<data.length; i++){
						var listNode = $('<li></li>');
						var contain = $('<ul></ul>');
						var content = $('<li></li>');
						if(data[i].lastActivity!==null){
							content[0].innerHTML = data[i].lastActivity;
						}
						else{
							content[0].innerHTML = "no activity";
						}
						contain[0].innerHTML = content[0].outerHTML;
						listNode[0].innerHTML = data[i].name+contain[0].outerHTML;
						$('#locations + .hidden-list').append(listNode[0].outerHTML);
					}
				}
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
	}
	if($('#logout').length>0){
		$('#logout').click(function(e){
			localStorage.setItem('user',null);
			window.location.replace('/');
		});
	}
});