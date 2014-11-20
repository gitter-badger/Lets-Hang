angular.module('dayController', [])
	.controller('mainController', function($scope, $http, Days){
		$scope.formData = {};

		Days.get()
			.success(function(data){
				$scope.days = data;
			})
			.error(function(data){
				$scope.message = 'COULD NOT CONNECT TO SERVER!!!';
			});
	});
