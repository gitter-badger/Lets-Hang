angular.module('monthController', ['monthService'])
	.controller('mainController', function($scope, $http, Months){
		$scope.formData = {};

		Months.get()
			.success(function(data){
				$scope.months = data;
			})
			.error(function(data){
				$scope.message = 'COULD NOT CONNECT TO SERVER!!!';
			});
	});
