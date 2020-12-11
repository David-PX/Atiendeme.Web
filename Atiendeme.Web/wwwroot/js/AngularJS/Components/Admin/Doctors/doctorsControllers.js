(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("doctorsControllers", doctorsControllers);

    function doctorsControllers($timeout, $scope, userService, doctorService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            email: "",
            phoneNumber: "",
            specialties: [],
            offices: []
        };

        //#region public members
        self.addDoctor = addDoctor;
        self.editDoctor = editDoctor;
        self.deleteDoctor = deleteDoctor;
        self.saveDoctor = saveDoctor;

        //#endregion public members

        initialize();

        function initialize() {

            self.userService = userService;
            self.doctorService = doctorService;

            self.doctorService.getDoctors();
             
            console.log("Im here doctorController");
        }

        //Table logic
        function addDoctor() {
            resetForm();
            $('#doctorModal').modal('show');
        }

        function editDoctor(office) {
            self.form = angular.copy(office);

            $('#doctorModal').modal('show');
        }

        function deleteDoctor(office) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer eliminar este consultorio?',
                "Esta información no podra ser recuperada.",
                'warning',
                true,
                "Cancelar",
                "Eliminar")
                .then((result) => {
                    if (result) {
                        doctorService.deleteDoctor(office.id).then(function (response) {
                            notificationService.showToast("Doctor eliminado.", "Registro borrado", "success");
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });
        }

        function saveDoctor() {
            if (self.doctorForm.$valid) {
                doctorService.saveDoctor(self.form).then(function (response) {
                    $('#doctorModal').modal('hide');
                    notificationService.showToast("Doctor creada o modificada con exito", "Èxito", "success");
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
                phoneNumber: "",
                specialties: [],
                offices: []
            };
        }

        function applyAndSetDirtyForm(waitFormDiggest) {
            //This method wait a little for ng-required to be $$phase in the scope
            $timeout(() => {
                if (waitFormDiggest)
                    applyAndSetDirtyForm();
                else
                    setFormInputDirty(self.doctorForm);
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