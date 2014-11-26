angular.module('monthService', [])
	.factory('Months', ['$http',function($http){
		return {
			get: function(){
				return $http.get(window.env.dev.backendCalURI+'/api/months');
			}
		};
	}]);
