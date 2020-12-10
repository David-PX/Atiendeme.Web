(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("officesController", officesController);

    function officesController($timeout, $scope, userService, officeService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            email: "",
            telephone: "",
            address: ""
        };

        //#region public members
        self.addOffice = addOffice;
        self.editOffice = editOffice;
        self.deleteOffice = deleteOffice;
        self.saveOffice = saveOffice;

        //#endregion public members

        initialize();

        function initialize() {
            self.userService = userService;
            self.officeService = officeService;
            console.log("Im here consultorioController");
        }

        //Table logic
        function addOffice() {
            resetForm();
            $('#officeModal').modal('show');
        }

        function editOffice(office) {
            self.form = angular.copy(office);
            $('#officeModal').modal('show');
        }

        function deleteOffice(office) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer eliminar este consultorio?',
                "Esta información no podra ser recuperada.",
                'warning',
                true,
                "Cancelar",
                "Eliminar")
                .then((result) => {
                    if (result) {
                        officeService.deleteOffice(office.id).then(function (response) {
                            notificationService.showToast("Oficina eliminada.", "Registro borrado", "success");
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });
        }

        function saveOffice() {
            if (self.officeForm.$valid) {
                officeService.saveOffice(self.form).then(function (response) {
                    $('#officeModal').modal('hide');
                    notificationService.showToast("Oficina creada o modificada con exito", "Èxito", "success");
                }, function (error) {
                    console.error(error);
                    notificationService.showToast("Ha ocurrido un error", "Error", "error");
                })
            } else {
                notificationService.showToast("Tiene que llenar todos los campos requeridos", "Campos faltantes", "error");
                applyAndSetDirtyForm(false)
            }
        }

        function resetForm() {
            self.form = {
                name: "",
                email: "",
                telephone: "",
                address: ""
            };
        }

        function applyAndSetDirtyForm(waitFormDiggest) {
            //This method wait a little for ng-required to be $$phase in the scope
            $timeout(() => {
                if (waitFormDiggest)
                    applyAndSetDirtyForm();
                else
                    setFormInputDirty(self.officeForm);
            }, 100);
        }

        function setFormInputDirty(form) {
            angular.forEach(form.$error,
                controls =>
                    controls.forEach(control =>
                        control.$setDirty()
                    ));
        }
    }
})();