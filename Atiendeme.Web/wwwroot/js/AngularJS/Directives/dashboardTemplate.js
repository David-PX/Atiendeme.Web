(function () {
    angular.module('atiendeme').directive("dashboardTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Partials/dashboardTemplate.html",
            controller: "dashboardController"
        };
    });
}());