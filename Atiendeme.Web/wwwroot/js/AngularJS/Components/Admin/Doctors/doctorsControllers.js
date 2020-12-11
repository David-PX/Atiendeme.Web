(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("doctorsControllers", doctorsControllers);

    function doctorsControllers($timeout, $scope, userService, doctorService, specialtiesService, officeService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            email: "",
            phoneNumber: "",
            specialties: [],
            offices: [],
            doctorLaborDays: []
        };

        self.laborDayForm = {
            office: {},
            day: "",
            startTime: "",
            endTime: ""
        }

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
            self.officeService = officeService;
            self.specialtiesService = specialtiesService;
            //
            self.doctorService.getDoctors();

            self.localLanguage = {
                selectAll: "Todos all",
                selectNone: "Ninguno",
                reset: "Deshacer",
                search: "Escriba para buscar...",
                nothingSelected: "Sin Seleccionar"         //default-label is deprecated and replaced with this.
            }

            console.log("Im here doctorController");
        }

        //Table logic
        function addDoctor() {
            resetForm();

            $('#doctorModal').modal('show');
        }

        function editDoctor(office) {
            resetForm();
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

                if (self.form.password === self.form.confirmPassword) {
                    doctorService.saveDoctor(self.form).then(function (response) {
                        $('#doctorModal').modal('hide');
                        notificationService.showToast("Doctor creada o modificada con exito", "Èxito", "success");
                    }, function (error) {
                        console.error(error);
                        notificationService.showToast("Ha ocurrido un error", "Error", "error");
                    })
                } else {
                    notificationService.showToast("La contraseña no coincide", "Error", "error");
                }
            } else {
                notificationService.showToast("Tiene que llenar todos los campos requeridos", "Campos faltantes", "error");
                applyAndSetDirtyForm(self.doctorForm, false)
            }
        }

        function resetForm() {
            self.form = {
                name: "",
                email: "",
                phoneNumber: "",
                specialties: [],
                offices: [],
                doctorLaborDays: []
            };

            self.officeService.offices.forEach(function (_office) {
                _office.ticket = self.form.offices.find(function (office) {
                    return _office.id == office.id
                }) ? true : false;
            });

            self.specialtiesService.specialties.forEach(function (specialties) {
                specialties.ticket = self.form.specialties.find(function (_specialties) {
                    return _specialties.id == specialties.id
                }) ? true : false;
            });
        }

        /////////
        self.addLaborDay = function () {
            if (self.laborForm.$valid) {
                var laborDay = angular.copy(self.laborDayForm);
                laborDay.officeId = laborDay.office.id;
                laborDay.doctorId = self.form.doctorId;
                self.form.doctorLaborDays.push(laborDay);

                self.laborDayForm = {
                    office: {},
                    day: "",
                    startTime: "",
                    endTime: ""
                }
            } else {
                notificationService.showToast("Tiene que llenar los campos del horario", "Campos faltantes", "error");
                applyAndSetDirtyForm(self.laborForm, false)
            }
        }

        self.deleteLaborDay = function (index) {
            this.form.doctorLaborDays.splice(index, 1);
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