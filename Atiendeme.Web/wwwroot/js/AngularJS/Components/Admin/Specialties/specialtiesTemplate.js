(function () {
    angular.module('atiendeme').directive("specialtiesTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Admin/Specialties/specialtiesTemplate.html",
            controller: "specialtiesController",
            controllerAs: "specialties"
        };
    });
}());