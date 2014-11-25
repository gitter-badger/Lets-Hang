angular.module('DayService', [])
	.factory('Days', function($http){
		return {
			get: function(){
				return $http.get(window.env.dev.backendCalURI+'/api/days');
			}
		};
	});
