(function () {
    angular.module('atiendeme').directive("dependentTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Patient/Dependent/dependentTemplate.html",
            controller: "dependentController",
            controllerAs: "dependent"
        };
    });
}());