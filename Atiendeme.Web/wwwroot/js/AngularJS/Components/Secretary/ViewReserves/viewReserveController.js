(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("viewReserveController", viewReserveController);

    function viewReserveController(reserveService, userService, notificationService) {
        var self = this;

        self.status = "";

        self.reserveSelected = {};
        //#region public members

        //#endregion public members
        initialize();

        function initialize() {
            self.userService = userService;
            //
            self.reserveService = reserveService;

            self.reserveService.secretaryReservationList().then(response => {
                self.reservations = response;
            });
        }

        self.showModal = function (reserve) {
            self.reserveSelected = angular.copy(reserve);

            $('#declineReserve').modal('show');
        }

        self.closeModal = function () {
            self.reserveSelected = {};

            $('#declineReserve').modal('hide');
        }

        self.changeReserveStatus = changeReserveStatus;
        function changeReserveStatus() {
            if (self.changeReserveStatus) {
                self.reserveService.changeReserveStatus(self.reserveSelected.id, self.status).then(function (response) {
                    notificationService.showToast("Modificada", "Ha solicitado esta cita", "success");
                    self.reserveService.secretaryReservationList().then(response => {
                        self.reservations = response;
                        self.closeModal();
                    });
                }, function (error) {
                    console.error(error);
                    notificationService.showToast("Ha ocurrido un error", "Error", "error");
                });
            }
        }
    }
})();