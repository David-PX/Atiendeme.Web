(function () {
    angular.module('atiendeme').directive("secretariesTemplate", function () {
        return {
            restrict: 'E',
            templateUrl: "../js/AngularJS/Components/Admin/Secretaries/secretariesTemplate.html",
            controller: "secretariesControllers",
            controllerAs: "secretary"
        };
    });
}());