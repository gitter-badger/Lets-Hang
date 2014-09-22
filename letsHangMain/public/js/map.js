var map;
window.onload = function(){
	$.ajax({
		url:'/main/locations',
		type:'POST',
		data:{email: localStorage.getItem('email')},
		success:function(data){
			if(data){
        console.log(data);
			  function initialize() {
  				var mapOptions = {
    				center: new google.maps.LatLng(data.lat, data.lng),
    				zoom: 8
  				};
  				map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  				console.log(marker);
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
		    google.maps.event.addDomListener(window, 'load', initialize());
		  }
		  else{
        function initialize() {
          var mapOptions = {
            center: new google.maps.LatLng(0, 0),
            zoom: 8
          };
          map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
          console.log(marker);
          var contentString = '<div id="content">'+
          '<div id="prevGroup">'+
          '<h2>Need to Create an Event</h2>'+
          '<h3>Get Started Over there &raquo;</h3>'+
          '</div>'+
          '</div>';
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });
          var marker = new google.maps.Marker({
            position: mapOptions.center,
            map: map,
            title: 'Need an Event'
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