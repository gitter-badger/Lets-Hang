angular.module('yearService', [])
	.factory('Years', ['$http', function($http){
		return {
			get: function(){
				return $http.get(window.env.dev.backendCalURI+'/api/years');
			}
		};
	}]);
