(function () {
    angular.module('atiendeme').directive("doctorReservesTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Doctors/DoctorReserves/doctorReservesTemplate.html",
            controller: "doctorReservesController",
            controllerAs: "doctorR"
        };
    });
}());