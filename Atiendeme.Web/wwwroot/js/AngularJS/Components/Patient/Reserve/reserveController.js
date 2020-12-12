(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("reserveController", reserveController);

    function reserveController($timeout, $scope, doctorService, specialtiesService, userService, dependentService, officeService, notificationService) {
        var self = this;

        self.form = {
            name: "",
            email: "",
            telephone: "",
            address: ""
        };

        //#region public members

        //#endregion public members
        initialize();

        function initialize() {
            self.stepper = new Stepper($('.bs-stepper')[0])

            self.userService = userService;
            self.officeService = officeService;
            self.specialtiesService = specialtiesService;
            self.dependentService = dependentService;
        }

        self.next = function () {
            self.stepper.next();
        }

        self.back = function () {
            self.stepper.previous();
        }

        self.doctorLaborDays = doctorLaborDays;
        function doctorLaborDays() {
            if (self.reserveForm.doctor != null && self.reserveForm.office != null) {

            //    doctorService.doctorLaborDays(self.reserveForm.doctor.id, self.reserveForm.office.id).then(function (response) {
            //        console.log(response);
            //})

               var doctorLaborDays = self.reserveForm.doctorLaborDays.filter(x => x.officeId === self.reserveForm.office.id)

            }
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
}) ();