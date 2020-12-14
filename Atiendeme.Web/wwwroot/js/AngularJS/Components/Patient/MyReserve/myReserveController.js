(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("myReserveController", myReserveController);

    function myReserveController(reserveService, userService, notificationService) {
        var self = this;

        //#region public members

        //#endregion public members
        initialize();

        function initialize() {
            self.userService = userService;
            //
            self.reserveService = reserveService;

            self.reserveService.getCurrentUserReservation().then(response => {
                self.userReservations = response;
            });
        }

        self.deniedRequest = deniedRequest;
        function deniedRequest(reserveId) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer cancelar esta cita?',
                "Esta acción no puede se puede deshacer.",
                'warning',
                true,
                "Cancelar",
                "Cancelar")
                .then((result) => {
                    if (result) {
                        self.reserveService.changeReserveStatus(reserveId,"Cancelada").then(function (response) {

                            notificationService.showToast("Cancelada", "Solicitud Cancelada", "error");
                            self.reserveService.getCurrentUserReservation().then(response => {
                                self.userReservations = response;
                                $scope.$apply();

                            });
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });
                   
                    }
                });
        }

    }
})();