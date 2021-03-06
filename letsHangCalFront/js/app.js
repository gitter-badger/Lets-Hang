window.env = {
	dev: {
		backendCalURI: 'http://127.0.0.1:1337',
		mainAppURI: 'http://127.0.0.1:8080'
	}
};
var app = angular.module('app', [
	'ui.router',
	'calendarController',
	'yearController',
	'monthController',
	'dayController',
	'activityController'
]);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	//$urlRouterProvider.otherwise('/calendar');
	$stateProvider
		.state('calendar', {
			url: '/',
			template: '<ui-view/>'
		})
		.state('calendar.calendar', {
			url: '/calendar',
			templateURL: '/partials/indexCal.html',
			controller: 'calendarController'
		})
		.state('calendar.year', {
			url: '/calendar/:year',
			templateURL: '/partials/year.html',
			controller: 'yearController'
		})
		.state('calendar.month', {
			url: '/calendar/:year/:month',
			templateURL: '/partials/month.html',
			controller: 'monthController'
		})
		.state('calendar.day', {
			url: '/calendar/:year/:month/:day',
			templateURL: '/partials/day.html',
			controller: 'dayController'
		});
	$locationProvider
		.html5Mode(false)
		.hashPrefix('!');
}]);

app.controller('calendarController', ['$scope', function($scope){
	var currentYear = new Date().getFullYear();
	$scope.years = [
		currentYear,
		currentYear+1,
		currentYear+2
	];
}]);
