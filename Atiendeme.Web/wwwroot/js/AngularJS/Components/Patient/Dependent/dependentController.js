(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("dependentController", dependentController);

    function dependentController($timeout, $scope, userService, dependentService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            lastName: "",
            relationship: "",
            age: "",
            email: "",
            idCard: "",
            patientId:""
        };

        //#region public members
        self.addDependent = addDependent;
        self.editDependent = editDependent;
        self.deleteDependent = deleteDependent;
        self.saveDependent = saveDependent;

        //#endregion public members

        initialize();

        function initialize() {
            self.userService = userService;
            self.dependentService = dependentService;

            self.localLanguage = {
                selectAll: "Todos all",
                selectNone: "Ninguno",
                reset: "Deshacer",
                search: "Escriba para buscar...",
                nothingSelected: "Nada seleccionado"         //default-label is deprecated and replaced with this.
            }

            console.log("I am in dependent");
        }

        //Table logic
        function addDependent() {
            resetForm();
            $('#dependentModal').modal('show');

        }

        function editDependent(dependent) {
            self.form = angular.copy(dependent);

            $('#dependentModal').modal('show');
        }

        function deleteDependent(dependent) {
            notificationService.showConfirmationSwal(
                '¿Está seguro de querer eliminar este dependiente?',
                "Esta información no podra ser recuperada.",
                'warning',
                true,
                "Cancelar",
                "Eliminar")
                .then((result) => {
                    if (result) {
                        dependentService.deleteDependent(dependent.id).then(function (response) {
                            notificationService.showToast("Dependiente eliminado.", "Registro borrado", "success");
                        }, function (error) {
                            console.error(error);
                            notificationService.showToast("Ha ocurrido un error", "Error", "error");
                        });

                        $scope.$apply();
                    }
                });
        }

        function saveDependent() {
            if (self.dependentForm.$valid) {

                self.form.patientId = self.userService.currentUser.id;

                dependentService.saveDependent(self.form).then(function (response) {
                    $('#dependentModal').modal('hide');
                    notificationService.showToast("Dependiente creado o modificado con exito", "Èxito", "success");
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
                lastName: "",
                relationship: "",
                age: "",
                email: "",
                idCard: "",
                patientId: ""
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
