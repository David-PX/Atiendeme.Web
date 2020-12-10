(function () {
    angular.module('atiendeme').directive("officesTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Admin/Offices/officesTemplate.html",
            controller: "officesController",
            controllerAs: "offices"
        };
    });
}());