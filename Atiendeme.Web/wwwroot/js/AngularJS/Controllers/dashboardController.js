(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("dashboardController", dashboardController);

    function dashboardController($timeout, $window) {
        var self = this;

        initialize();

        function initialize() {
            console.log("IM THE DASHBOARD");
        }
    }
})();