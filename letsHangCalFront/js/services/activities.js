angular.module('activityService', [])
	.factory('Activity', ['$http', function($http){
		return {
			create: function(){
				return $http.post(window.env.dev.backendCalURI+'/api/activities');
			},
			edit: function(){
				return $http.put(window.env.dev.backendCalURI+'/api/activities');
			},
			delete: function(){
				return $http.delete(window.env.dev.backendCalURI+'/api/activities');
			}
		};
	}]);
