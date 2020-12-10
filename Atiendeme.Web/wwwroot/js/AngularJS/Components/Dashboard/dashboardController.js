(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("dashboardController", dashboardController);

    function dashboardController($timeout, $window, userService) {
        var self = this;

        initialize();

        function initialize() {
            self.userService = userService; 
        }
    }
})();