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
});