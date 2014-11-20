angular.module('yearService', [])
	.factory('Years', function($http){
		return {
			get: function(){
				return $http.get(window.env.backendCalURI+'/api/years');
			}
		}
	});
