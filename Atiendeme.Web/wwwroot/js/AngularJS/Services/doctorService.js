(function () {
    angular.module('atiendeme').service("doctorService", doctorService);

    function doctorService(doctorRepository) {
        var self = this;

        self.doctors = [];

        self.getDoctors = getDoctors;

        initializeService();

        function initializeService() {
            console.log("initialize");
        }

        function getDoctors() {
            return doctorRepository.getDoctors().then(function (response) {
                self.doctors = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }
        return self;
    }
}());