app.config(function ($routeProvider) {
    $routeProvider.

        //The below will be loaded when url is at home page
        when('/dashboard', {
            template: '<dashboard-template></dashboard-template>'
        })
        .when('/dashboard', {
            template: '<dashboard-template></dashboard-template>'
        })
        .when('/admin/offices', {
            template: '<offices-template></offices-template>'
        })
        .when('/admin/doctors', {
            template: '<doctors-template></doctors-template>'
        })
        .when('/admin/specialties', {
            template: '<specialties-template></specialties-template>'
        })
        .otherwise({ redirectTo: '/dashboard' });;

    //The below will be loaded when url is changed to pageURL/AngularJS
    //.when('/AngularJS', {
    //    templateUrl: 'pages/AngularJS.html',
    //    controller: 'AngularJSController'
    //});

    //The below will be loaded when url is changed to pageURL/Code2Succeed
    //.when('/Code2Succeed', {
    //    templateUrl: 'pages/Code2Succeed.html',
    //    controller: 'Code2SucceedController'
    //});

    //If clicked on any other link from navigation which has not been handled here, will be directed to home page
});

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);