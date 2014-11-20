angular.module('monthService', [])
	.factory('Months', function($http){
		return {
			get: function(){
				return $http.get(window.env.dev.backendCalURI+'/api/months');
			}
		};
	});
