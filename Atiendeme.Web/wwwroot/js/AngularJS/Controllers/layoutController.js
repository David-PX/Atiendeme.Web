(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("layoutController", layoutController);

    function layoutController($timeout, $window, userService, $scope) {
        var self = this;

        self.showNavBar = false;

        //Two way binding make this not neccessary
        //$scope.$on('userServiceLoaded', function (event, data) {
        initialize(); 
        //})
         
        function initialize() {

            
            self.userService = userService; 
        }
    }
})();