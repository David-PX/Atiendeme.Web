(function () {
    angular.module('atiendeme').directive("layoutTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Layout/layoutTemplate.html",
            controller: "layoutController",
            controllerAs: "layout"
        };
    });
}());