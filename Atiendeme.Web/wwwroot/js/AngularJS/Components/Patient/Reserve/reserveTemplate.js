(function () {
    angular.module('atiendeme').directive("reserveTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Patient/Reserve/reserveTemplate.html",
            controller: "reserveController",
            controllerAs: "reserve"
        };
    });
}());