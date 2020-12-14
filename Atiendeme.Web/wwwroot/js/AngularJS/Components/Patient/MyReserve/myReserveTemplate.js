(function () {
    angular.module('atiendeme').directive("myReserveTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Patient/MyReserve/myReserveTemplate.html",
            controller: "myReserveController",
            controllerAs: "myReserve"
        };
    });
}());