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
        .when('/admin/secretaries', {
            template: '<secretaries-template></secretaries-template>'
        })

        //
        .when('/patient/reserve', {
            template: '<reserve-template></reserve-template>'
        })
        .when('/patient/myreserve', {
            template: '<my-reserve-template></my-reserve-template>'
        })

        .when('/patient/viewdoctors', {
            template: '<doctor-view-template></doctor-view-template>'
        })

        //
        .when('/secretary/viewreserve', {
            template: '<view-reserve-template></view-reserve-template>'
        })

        //
        .when('/doctor/doctorreserves', {
            template: '<doctor-reserves-template></doctor-reserves-template>'
        })

        .otherwise({ redirectTo: '/dashboard' });
});

app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);