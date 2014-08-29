var map;
window.onload = function(){
	$.ajax({
		url:'/main/locations',
		type:'POST',
		data:{user:localStorage.getItem('user')},
		success:function(data){
			if(data!==null){
        console.log(data);
				function initialize() {
  					var mapOptions = {
    					center: new google.maps.LatLng(data[0].Lat, data[0].Long),
    					zoom: 8
  					};
  					map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  					console.log(marker);
  					var contentString = '<div id="content">'+
  					'<div id="prevGroup">'+
  					'<h2>Last Activity:</h2>'+
  					'<h3>'+data[0].lastActivity+'</h3>'+
  					'</div>'+
  					'</div>';
  					var infowindow = new google.maps.InfoWindow({
  						content: contentString
  					});
  					var marker = new google.maps.Marker({
      					position: mapOptions.center,
      					map: map,
      					title: data[0].name+','+data[0].lastActivity
  					});
  					google.maps.event.addListener(marker, 'click', function() {
    					infowindow.open(map,marker);
  					});
				}
				google.maps.event.addDomListener(window, 'load', initialize());
			}
		}
	});
};
function mapNewActivity(activity){
  console.log(activity);
  var contentString = '<div id="content">'+
  '<div id="prevGroup">'+
  '<h2>Activity:</h2>'+
  '<h3>'+activity.name+'</h3>'+
  '<h3>'+activity.startDate+'</h3>'+
  '<h3>'+activity.startTime+'</h3>'+
  '</div>'+
  '</div>';
  var newInfowindow = new google.maps.InfoWindow({
              content: contentString
  });
  var newMarker = new google.maps.Marker({
    position: new google.maps.LatLng(activity.lat, activity.lng),
    title: activity.name
  });
  console.log(newMarker);
  newMarker.setMap(map);
  google.maps.event.addListener(newMarker, 'click', function() {
    newInfowindow.open(map,newMarker);
  });
}