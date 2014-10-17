var map;
function initialize(data) {
  var mapOptions = {
    center: new google.maps.LatLng(data.lat, data.lng),
    zoom: 8
  };
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  var contentString = '<div id="content">'+
  '<div id="prevGroup">'+
  '<h2>Last Activity:</h2>'+
  '<h3>'+data.name+'</h3>'+
  '</div>'+
  '</div>';
  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });
  var marker = new google.maps.Marker({
    position: mapOptions.center,
    map: map,
    title: data.name
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}
window.onload = function(){
	$.ajax({
		url:'/main/locations',
		type:'POST',
		data:{email: localStorage.getItem('email')},
		success:function(data){
      console.log(data);
			if(data){
		    google.maps.event.addDomListener(window, 'load', initialize(data));
		  }
		  else{
        google.maps.event.addDomListener(window, 'load', initialize({name:'Get Started Over there &raquo;', lat:0, lng:0}));
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
