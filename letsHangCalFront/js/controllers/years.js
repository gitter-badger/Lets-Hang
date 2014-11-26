angular.module('yearController', ['yearService'])
	.controller('mainController', ['$scope', '$http', function($scope, $http, Years){
		$scope.formData = {};

		Years.get()
			.success(function(data){
				$scope.years = data;
			})
			.error(function(data){
				$scope.message = 'COULD NOT CONNECT TO SERVER!!!';
			});
	}]);
