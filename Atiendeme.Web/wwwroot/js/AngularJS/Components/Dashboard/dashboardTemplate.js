(function () {
    angular.module('atiendeme').directive("dashboardTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Dashboard/dashboardTemplate.html",
            controller: "dashboardController",
            controllerAs: "dashboard"
        };
    });
}());