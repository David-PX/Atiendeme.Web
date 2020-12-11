(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("specialtiesController", specialtiesController);

    function specialtiesController($timeout, $scope, userService, specialtiesService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            description: ""
        };

        //#region public members
        self.addSpecialties = addSpecialties;
        self.editSpecialties= editSpecialties;
        self.deleteSpecialties = deleteSpecialties;
        self.saveSpecialties = saveSpecialties;

        //#endregion public members

        initialize();

        function initialize() {
            self.userService = userService;
            self.specialtiesService = specialtiesService;

            self.localLanguage = {
                selectAll: "Todos all",
                selectNone: "Ninguno",
                reset: "Deshacer",
                search: "Escriba para buscar...",
                nothingSelected: "Nada seleccionado"         //default-label is deprecated and replaced with this.
            }

            console.log("Tamo aqui klokkkkkkkkkkkkk");
        }

        //Table logic
        function addSpecialties() {
            resetForm();
            $('#specialtiesModal').modal('show');
        }

        function editSpecialties(specialties) {
            self.doctorsForCrud = angular.copy(userService.doctors);

            self.form = angular.copy(specialties);

            self.doctorsForCrud.forEach(function (_doctor) {

                _doctor.ticket = self.form.doctors.find(function (doctor) {

                    return _doctor.id == doctor.id
                }) ? true : false;


            });
            $('#specialtiesModal').modal('show');
        }

        function deleteSpecialties(specialties) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer eliminar esta especialidad?',
                "Esta información no podra ser recuperada.",
                'warning',
                true,
                "Cancelar",
                "Eliminar")
                .then((result) => {
                    if (result) {
                        specialtiesService.deleteSpecialties(specialties.id).then(function (response) {
                            notificationService.showToast("Especialidad eliminada.", "Registro borrado", "success");
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });
        }

        function saveSpecialties() {
            if (self.specialitesForm.$valid) {
                specialtiesService.saveSpecialties(self.form).then(function (response) {
                    $('#specialtiesModal').modal('hide');
                    notificationService.showToast("Especialidad creada o modificada con exito", "Èxito", "success");
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
                description: ""
            };
            self.doctorsForCrud = angular.copy(userService.doctors);
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