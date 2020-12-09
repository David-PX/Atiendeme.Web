(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("layoutController", layoutController);

    function layoutController($timeout, $window, userRepository) {
        var self = this;

        initialize();

        function initialize() {
            console.log("JA JA JA JA ");

            userRepository.getCurrentUser();
        }
    }
})();