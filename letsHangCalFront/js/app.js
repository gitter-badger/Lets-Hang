window.env = {
	dev: {
		backendCalURI: 'http://127.0.0.1:1337',
		mainAppURI: 'http://127.0.0.1:8080'
	}
};
var app = angular.module('app', [
	'ui.router',
	'yearService',
	'monthService',
	'dayService',
	'activityService',
	'yearController',
	'monthController',
	'dayController',
	'activityController'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	$urlRouterProvider.otherwise('/calendar');
	$stateProvider
		.state('calendar', {
			url: '/',
			template: 'partials/indexCal.html',
			controller: 'calendarController'
		})
		.state('year', {
			url: '/:year',
			template: 'partials/year.html',
			controller: 'yearController'
		})
		.state('month', {
			url: '/:year/:month',
			template: 'partials/month.html',
			controller: 'monthController'
		})
		.state('day', {
			url: '/:year/:month/:day',
			template: 'partials/day.html',
			controller: 'dayController'
		});
	$locationProvider
		.html5Mode(false)
		.hashPrefix('!');
}]);


app.controller('calendarController', ['$scope', function($scope){
	$scope.years = [
		new Date().getFullYear(),
		new Date(new Date().getFullYear()+1).getFullYear,
		new Date(new Date().getFullYear()+2).getFullYear()
	];
}]);
