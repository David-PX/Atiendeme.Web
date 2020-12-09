var app = angular.module("atiendeme", ['ngRoute', 'moment-picker', 'ng-currency', 'vsGoogleAutocomplete']);

app = angular.module("atiendeme").config(function (momentPickerProvider) {
    momentPickerProvider.options({
        minutesStep: 30
    });
});

//Add this on config section
app.config(function ($routeProvider) {
    $routeProvider.

        //The below will be loaded when url is at home page
        when('/', {
            templateUrl: 'pages/home.html',
            controller: 'HomeController'
        })

        //The below will be loaded when url is changed to pageURL/AngularJS
        .when('/AngularJS', {
            templateUrl: 'pages/AngularJS.html',
            controller: 'AngularJSController'
        })

        //The below will be loaded when url is changed to pageURL/Code2Succeed
        .when('/Code2Succeed', {
            templateUrl: 'pages/Code2Succeed.html',
            controller: 'Code2SucceedController'
        })

        //If clicked on any other link from navigation which has not been handled here, will be directed to home page
        .otherwise({ redirectTo: '/' });
});