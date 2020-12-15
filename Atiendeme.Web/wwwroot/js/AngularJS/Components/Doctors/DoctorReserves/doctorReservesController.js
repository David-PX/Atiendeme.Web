(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("doctorReservesController", doctorReservesController);

    function doctorReservesController(reserveService, userService, $rootScope, $scope, notificationService) {
        var self = this;

        //#region public members
        self.reserveSelected = {};
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

        self.showModal = function (reserve) {
            self.reserveSelected = angular.copy(reserve);

            if (self.reserveSelected.forDependent)
                self.reserveSelected.user = self.reserveSelected.dependent;
            else
                self.reserveSelected.user = self.reserveSelected.patient;


            $('#currentReserve').modal('show');
        }

        self.closeModal = function () {
            self.reserveSelected = {};

            $('#currentReserve').modal('hide');
        }

        self.changeReserveStatus = changeReserveStatus;
        function changeReserveStatus() {
             
            notificationService.showConfirmationSwal(
                '¿Está seguro de completar esta cita?',
                "El usuario sera notificado y esta acción no puede modificarse.",
                'warning',
                true,
                "Cancelar",
                "Terminar Cita")
                .then((result) => {
                    if (result) {
                        self.reserveService.changeReserveStatus(self.reserveSelected.id, "Completada").then(function (response) {
                            notificationService.showToast("Completada", "Ha marcado esta cita como completada", "success");
                            self.reserveService.secretaryReservationList().then(response => {
                                self.reservations = response;
                                self.closeModal();
                            });
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });

              
           
        }
    }
})();