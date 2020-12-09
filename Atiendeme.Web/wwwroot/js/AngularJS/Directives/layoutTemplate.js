(function () {
    angular.module('atiendeme').directive("layoutTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Partials/layoutTemplate.html",
            controller: "layoutController",
            controllerAs: "layout"
        };
    });
}());