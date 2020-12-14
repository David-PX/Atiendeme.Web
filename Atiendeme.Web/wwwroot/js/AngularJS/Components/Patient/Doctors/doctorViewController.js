(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("doctorViewController", doctorViewController);

    function doctorViewController(userService, doctorService) {
        var self = this;

        //#region public members
        self.doctors = [];
        //#endregion public members
        initialize();

        function initialize() {
            self.userService = userService;
            self.doctorService = doctorService;

            self.doctorService.getDoctors().then(response => {
                response.forEach(doctor => {
                    console.log(doctor);

                    var uniqueSpecialties = [...new Set(doctor.specialties.map(x => x.name))];
                    var uniqueOffices = [...new Set(doctor.offices.map(x => x.name))];

                    doctor.specialtiesString = Array.prototype.map.call(uniqueSpecialties, function (item) { return item; }).join(", ");
                    doctor.officesString = Array.prototype.map.call(uniqueOffices, function (item) { return item; }).join(", ");


                });

                self.doctors = response;
            });
        }
    }
})();