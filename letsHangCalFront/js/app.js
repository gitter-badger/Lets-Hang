window.env = {
	dev: {
		backendCalURI: 'http://127.0.0.1:1337',
		mainAppURI: 'http://127.0.0.1:8080'
	}
};
var app = angular.module('app', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
	$urlRouterProvider.otherwise('/calendar');
	$stateProvider
		.state('calendar', {
			url: '/calendar',
			template: '/partials/indexCal.html'
		})
		.state('year', {
			url: '/calendar/:year',
			template: '/partials/year.html'
		})
		.state('month', {
			url: '/calendar/:year/:month',
			template: '/partials/month.html'
		})
		.state('day', {
			url: '/calendar/:year/:month/:day',
			template: '/partials/day.html'
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
