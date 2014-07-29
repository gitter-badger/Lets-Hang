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
					localStorage.setItem('user',data.user);
					window.location.replace('/main');
				}
			}
		});
	});
	if($('#activities').length>0){
		$.ajax({
			url: '/main/activities',
			type: 'GET',
			success: function(data){
				console.log(data);
				console.log(data[0].name);
				if(data!==null){
					for(var i =0; i<data.length; i++){
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
			$('.hidden-list').toggleClass('unhidden');
		});
	}
});