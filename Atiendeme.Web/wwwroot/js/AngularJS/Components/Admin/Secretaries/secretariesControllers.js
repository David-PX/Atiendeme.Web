(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("secretariesControllers", secretariesControllers);

    function secretariesControllers($timeout, $scope, userService, doctorService, secretariesService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            email: "",
            phoneNumber: "",
            doctors: [],
        }; 

        self.doctors = [];
        //#region public members
        self.addSecretary = addSecretary;
        self.editSecretary = editSecretary;
        self.deleteSecretary = deleteSecretary;
        self.saveSecretary = saveSecretary;

        //#endregion public members

        initialize();

        function initialize() {
            self.userService = userService;
            self.doctorService = doctorService;
            self.secretariesService = secretariesService;
            
            self.secretariesService.getSecretaries();
            self.doctorService.getDoctors().then(doctors => self.doctors = doctors);
            self.localLanguage = {
                selectAll: "Todos all",
                selectNone: "Ninguno",
                reset: "Deshacer",
                search: "Escriba para buscar...",
                nothingSelected: "Sin Seleccionar"         //default-label is deprecated and replaced with this.
            } 
        }

        //Table logic
        function addSecretary() {
            resetForm();

            self.doctorService.doctors.forEach(function (_doctor) {
                _doctor.ticket = self.form.doctors.find(function (doctor) {
                    return _doctor.id == doctor.id
                }) ? true : false;
            }); 

            $('#secretaryModal').modal('show');
        }

        function editSecretary(doctor) {
            resetForm();
            self.form = angular.copy(doctor);

            self.form.doctors = [];
 
            self.form.secretaryDoctors.forEach(x => {
                self.form.doctors.push(x.doctor)
            })

            self.doctorService.doctors.forEach(function (_doctor) {
                _doctor.ticket = self.form.doctors.find(function (doctor) {
                    return _doctor.id == doctor.id
                }) ? true : false;
            }); 

            $('#secretaryModal').modal('show');
        }

        function deleteSecretary(secretary) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer eliminar esta secretaria?',
                "Esta información no podra ser recuperada.",
                'warning',
                true,
                "Cancelar",
                "Eliminar")
                .then((result) => {
                    if (result) {
                        self.secretariesService.deleteSecretary(secretary.id).then(function (response) {
                            notificationService.showToast("Secretaria eliminada.", "Registro borrado", "success");
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });
        }

        function saveSecretary() {
            if (self.secretaryForm.$valid) {
                if (self.form.password === self.form.confirmPassword || self.form.id) {
                    self.secretariesService.saveSecretary(self.form).then(function (response) {
                        $('#secretaryModal').modal('hide');
                        notificationService.showToast("Secretaria creada o modificada con exito", "Èxito", "success");
                    }, function (error) {
                        console.error(error);
                        notificationService.showToast("Ha ocurrido un error", "Error", "error");
                    })
                } else {
                    notificationService.showToast("La contraseña no coincide", "Error", "error");
                }
            } else {
                notificationService.showToast("Tiene que llenar todos los campos requeridos", "Campos faltantes", "error");
                applyAndSetDirtyForm(self.secretaryForm, false)
            }
        }

        function resetForm() {
            self.form = {
                name: "",
                email: "",
                phoneNumber: "", 
                doctors: [], 
            };
        }

         
        function applyAndSetDirtyForm(form, waitFormDiggest) {
            //This method wait a little for ng-required to be $$phase in the scope
            $timeout(() => {
                if (waitFormDiggest)
                    applyAndSetDirtyForm(form);
                else
                    setFormInputDirty(form);
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