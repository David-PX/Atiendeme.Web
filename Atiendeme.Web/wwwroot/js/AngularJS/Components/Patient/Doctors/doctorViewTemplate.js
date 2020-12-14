(function () {
    angular.module('atiendeme').directive("doctorViewTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Patient/Doctors/doctorViewTemplate.html",
            controller: "doctorViewController",
            controllerAs: "doctorView"
        };
    });
}());