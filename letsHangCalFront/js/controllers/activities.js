angular.module('activityController', [])
	.controller('mainController', function($scope, $http, Activities){
		$scope.formData = {};

		$scope.createActivity = function(){
			if(!$.isEmptyObject($scope.formData)){
				Activities.create($scope.formData)
					.success(function(data){
						$scope.formData = {};
						$scope.activity = data;
					})
					.error(function(data){
						$scope.message = "CANNOT CONNECT TO SERVER!!!";
					});
			}
		}
		$scope.editActivity = function(){
			if(!$.isEmptyObject($scope.formData)){
				Activities.edit($scope.formData)
					.success(function(data){
						$scope.formData = {};
						$scope.activity = data;
					})
					.error(function(data){
						$scope.message = "CANNOT CONNECT TO SERVER!!!";
					});
			}
		}
		$scope.deleteActivitiy = function(){
			Activities.delete(id)
				.success(function(data) {
							$scope.todos = data;
						})
						.error(function(data) {
							$scope.message = "CANNOT CONNECT TO SERVER!!!";
						});
		}
	});
