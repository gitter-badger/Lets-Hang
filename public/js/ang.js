"use strict";
var activitiesNG = angular.module('actvitiesNG', []);

function activitiesController($scope, $http){
	$scope.formData = {};

	$http.get('/main/activities')
		.success(function(data){
			$scope.activities = data;
		});
	
	$http.get('/main/messages')
		.success(function(data){
			$scope.message = data;
		});

	$http.get('/main/locations')
		.success(function(data){
			$scope.locations = data;
		});
}