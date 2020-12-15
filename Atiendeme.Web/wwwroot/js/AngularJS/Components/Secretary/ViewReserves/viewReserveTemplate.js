(function () {
    angular.module('atiendeme').directive("viewReserveTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Secretary/ViewReserves/viewReserveTemplate.html",
            controller: "viewReserveController",
            controllerAs: "viewR"
        };
    });
}());