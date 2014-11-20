angular.module('todoService', [])
	.factory('Todos', function($http){
		return {
			get: function(){
				return $http.get(window.env.backendCalURI+'/api/years');
			},
			create: function(yearData){
				return $http.post(window.env.backendCalURI+'/api/years', yearData);
			},
			delete: function(id){
				return $http.delete(window.env.backendCalURI+'/api/years/'+id);
			}
		}
	});
