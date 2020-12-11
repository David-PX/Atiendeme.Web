(function () {
    angular.module('atiendeme').directive("doctorsTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Admin/Doctors/doctorsTemplate.html",
            controller: "doctorsControllers",
            controllerAs: "doctors"
        };
    });
}());