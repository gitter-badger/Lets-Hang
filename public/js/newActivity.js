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
				console.log(data);
				var conNode = $('<li></li>');
				for(var i = 0; i<data.length; i++){
					conNode[0].innerHTML = data[i];
					console.log(conNode[0].outerHTML);
					conList[0].innerHTML += conNode[0].outerHTML;
				}
			}
		});
		conCont[0].innerHTML = conList[0].outerHTML;
		$(e.target).parent().append(conCont[0].outerHTML);
	});
});