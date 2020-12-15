(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("doctorReservesController", doctorReservesController);

    function doctorReservesController(reserveService, userService, $rootScope) {
        var self = this;

        //#region public members

        //#endregion public members
        initialize();

        $rootScope.$on('userServiceLoaded', function (evt, data) {
            self.reserveService.doctorReservations(self.userService.currentUser.id).then(response => {
                self.reservations = response;
            });
        })

        function initialize() {
            self.userService = userService;
            //
            self.reserveService = reserveService;
        }
    }
})();