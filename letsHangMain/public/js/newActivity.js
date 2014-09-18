"use strict";
function formatLoct(loct){
	if(loct.indexOf(' ')<=-1){
		return loct;
	}
	return formatLoct(loct.replace(' ','+'));
}
$(document).ready(function(){
	$('#overlayShowHide').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		$('#newActOverlay').toggleClass('collapse');
		if($('#overlayShowHide').html()=='<i class="glyphicon glyphicon-chevron-up"></i>'){
			$('#overlayShowHide').html('<i class="glyphicon glyphicon-chevron-down"></i>');
		}
		else{
			$('#overlayShowHide').html('<i class="glyphicon glyphicon-chevron-up"></i>');
		}
	});
	$('#addDate').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		$(e.target).replaceWith('<input id="endDate" class="form-control" type="date">');
	});
	$('#addEnd').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		$(e.target).replaceWith('<input id="endTime" class="form-control" type="time">');
	});
	var invCount = 0;
	$('#localInvBtn').click(function(e){
		e.preventDefault();
		localStorage.removeItem('invite');
		if(invCount <= 0){
			var conCont = $('<div></div>');
			var conList = $('<ul></ul>');
			$.ajax({
				url: '/main/invite',
				type: 'POST',
				data: {activity:'new activity', email: localStorage.getItem('email')},
				success: function(data){
					var conNode = $('<li></li>');
					for(var i = 0; i<data.length; i++){
						for(var j = 0; j<data[i].length; j++){
							conNode[0].innerHTML = data[i][j]+' '+'<button class="inviteThis btn btn-primary"><i class="fa fa-plus"></i></button>';
							conList[0].innerHTML += conNode[0].outerHTML;
						}
					}
					conCont[0].innerHTML = conList[0].outerHTML;
					$(e.target).parent().append(conCont);
					$('.inviteThis').bind('click',function(e){
						e.preventDefault();
						//e.stopPropagation();
						console.log(e.target);
						if(e.target==$('.inviteThis')[0]){
							console.log('click');
							var invited = $(e.target).parent().parent()[0].innerText.substring(0, $(e.target).parent().parent()[0].innerText.indexOf(' '));
							console.log(invited);
							if(!JSON.parse(localStorage.getItem('invited'))){
								console.log('new');
								localStorage.setItem('invited', JSON.stringify({arr: new Array(invited)}));
								e.target.innerHTML = '<i class="fa fa-minus"></i>';
								$('.inviteThis').toggleClass('minus');
							}
							else{
								var list = JSON.parse(localStorage.getItem('invited')).arr;
								console.log(list.length);
								console.log(list.indexOf(invited));
								if($('.inviteThis').attr('class').indexOf('minus')>=0){
									list[list.length] = invited;
									localStorage.setItem('invited', JSON.stringify({arr: list}));
									e.target.innerHTML = '<i class="fa fa-minus"></i>';
									$('.inviteThis').toggleClass('minus');
								}
								else{
									console.log('change');
									delete list[list.indexOf(invited)];
									localStorage.setItem('invited', JSON.stringify({arr: list}));
									e.target.innerHTML = '<i class="fa fa-plus"></i>';
									$('.inviteThis').toggleClass('minus');
								}
							}
						}
					});
					$('.inviteThis > .fa').bind('click',function(e){
						e.preventDefault();
						//e.stopPropagation();
						console.log(e.target);
						if($(e.target).parent()[0]==$('.inviteThis')[0]){
							console.log('click');
							var invited = $(e.target).parent().parent().parent()[0].innerText.substring(0, $(e.target).parent().parent().parent()[0].innerText.indexOf(' '));
							console.log(invited);
							if(!JSON.parse(localStorage.getItem('invited'))){
								console.log('new');
								localStorage.setItem('invited', JSON.stringify({arr: new Array(invited)}));
								$(e.target).parent()[0].innerHTML = '<i class="fa fa-minus"></i>';
								$('.inviteThis').toggleClass('minus');
							}
							else{
								var list = JSON.parse(localStorage.getItem('invited')).arr;
								console.log(list.length);
								console.log(list.indexOf(invited));
								if($('.inviteThis').attr('class').indexOf('minus')>=0){
									list[list.length] = invited;
									localStorage.setItem('invited', JSON.stringify({arr: list}));
									$(e.target).parent()[0].innerHTML = '<i class="fa fa-minus"></i>';
									$('.inviteThis').toggleClass('minus');
								}
								else{
									console.log('change');
									delete list[list.indexOf(invited)];
									localStorage.setItem('invited', JSON.stringify({arr: list}));
									$(e.target).parent()[0].innerHTML = '<i class="fa fa-plus"></i>';
									$('.inviteThis').toggleClass('minus');
								}
							}
						}
					});
				}
			});
		}
		invCount++;
	});
	$('#close, .close').click(function(){
		localStorage.removeItem('invite');
	});
	$('#save').click(function(){
		$('#invModal').modal('hide');
	});
	var actData = function(n, l, sD, eD, sT, eT, i, e){
		this.name = n;
		this.location = formatLoct(l);
		this.startDate = sD;
		this.endDate = eD;
		this.startTime = sT;
		this.endTime = eT;
		this.invited = i;
		this.email = e;
	}
	$('#newActSub').click(function(e){
		e.preventDefault();
		e.stopPropagation();
		if(localStorage.getItem('invited')!==null){
			var formData = new actData($('#newActName').val(),$('#newActLoct').val(),$('#startDate').val(),null,$('#startTime').val(),null,localStorage.getItem('invited').arr,localStorage.getItem('email'));
			if($('#endDate').length==0){
				formData.endDate = $('#endDate').val(); 
			}
			if($('#endTime').length==0){
				formData.endTime = $('#endTime').val();
			}
		}
		else{
			alert('No one is invited, please invite people before creating an activity');
			return;
		}
		console.log(formData.location);
		$.ajax({
			url: '/main/create-activity',
			type: 'POST',
			data: formData,
			success: function(data){
				console.log(data);
				mapNewActivity(data);
				sendInvite(data, 0);
			}
		});
	});
	$('#fbUBtn').bind('mousedown touchstart pointerdown', function(e){
		e.preventDefault();
		console.log('facebook');
		$.ajax({
			url:'/add/facebook',
			type:'GET',
			data:{name: localStorage.getItem('user')}
		});
	});
	$('#twUBtn').bind('mousedown touchstart pointerdown', function(e){
		e.preventDefault();
		console.log('twitter');
		$.ajax({
			url:'/add/twitter',
			type:'get',
			data:{name: localStorage.getItem('user')}
		});
	});
	$('#gUBtn').bind('mousedown touchstart pointerdown', function(e){
		e.preventDefault();
		console.log('google');
		$.ajax({
			url:'/add/google',
			type:'GET',
			data:{name: localStorage.getItem('user')}
		});
	});
});
function sendInvite(activity, i){
	if(i==activity.invited.length-1){
		$.ajax({
			url:'/main/invite-out',
			type:'POST',
			data:{
				user: activity.invited[i],
				outActivity: activity
			},
			success: function(data){
				console.log(data);
				alert('Your Activity Has Been Create');
				for(var j = 0; j<$('#newActForm').children().length; j++){
					if($('#newActForm').children()[j].class=='formControl'){
						$('#newActForm').children()[j].value=null;
					}
				}
			}
		});
		return;
	}
	else{
		$.ajax({
			url:'/main/invite-out',
			type:'POST',
			data:{
				user: activity.invited[i],
				outActivity: activity
			},
			success: function(data){
				console.log(data);
				alert('Your Activity Has Been Create');
				for(var j = 0; j<$('#newActForm').children().length; j++){
					if($('#newActForm').children()[j].class=='formControl'){
						$('#newActForm').children()[j].value=null;
					}
				}
			}
		});
		return sendInvite(activity, i+1);
	}
}
