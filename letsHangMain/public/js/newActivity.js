"use strict";
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
	$('#localInvBtn').click(function(e){
		e.preventDefault();
		var conCont = $('<div></div>');
		var conList = $('<ul></ul>');
		console.log('invite');
		$.ajax({
			url: '/main/invite',
			type: 'POST',
			data: {activity:'new activity', name: localStorage.getItem('user')},
			success: function(data){
				console.log(JSON.stringify(data));
				var conNode = $('<li></li>');
				for(var i = 0; i<data.length; i++){
					conNode[0].innerHTML = data[i].p0+' '+'<button class="inviteThis btn btn-primary" onclick="inviteThis(event)"><i class="fa fa-plus"></i></button>';
					console.log(conNode[0].outerHTML);
					conList[0].innerHTML += conNode[0].outerHTML;
				}
				conCont[0].innerHTML = conList[0].outerHTML;
				$(e.target).parent().append(conCont);
			}
		});
	});
});
function inviteThis(event){
	event.preventDefault();
	event.stopPropagation();
	console.log('click');
	var invited = $(event.target).parent()[0].innerHTML.substring(0, $(event.target).parent()[0].innerHTML.indexOf('<'));
	console.log(invited);
	if(!localStorage.getItem('invited')){
		localStorage.setItem('invited', JSON.stringify({arr: new Array(invited)}));
	}
	else{
		var list = JSON.parse(localStorage.getItem('invited')).arr;
		console.log(list.length);
		list[list.length]=invited;
		localStorage.setItem('invited', JSON.stringify({arr: list}));
	}
}