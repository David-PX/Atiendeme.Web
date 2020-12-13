(function () {
    angular.module('atiendeme').service("doctorService", doctorService);

    function doctorService(doctorRepository) {
        var self = this;

        self.doctors = [];

        self.getDoctors = getDoctors;
        self.saveDoctor = saveDoctor;
        self.deleteDoctor = deleteDoctor;
        self.doctorLaborDays = doctorLaborDays;
        self.doctorAvailability = doctorAvailability;

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
        function doctorLaborDays(doctorId, officeId) {
            return doctorRepository.doctorLaborDays(doctorId, officeId).then(function (response) {
                self.doctors = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function doctorAvailability(doctorId, officeId, day) {
            return doctorRepository.doctorAvailability(doctorId, officeId, day).then(function (response) {
                self.doctors = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function saveDoctor(form) {
            if (!form.id) {
                return doctorRepository.saveDoctor(form).then(function (response) {
                    return getDoctors();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            } else {
                return doctorRepository.updateDoctor(form).then(function (response) {
                    return getDoctors();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            }
        }

        function deleteDoctor(id) {
            return doctorRepository.deleteDoctor(id).then(function (response) {
                return getDoctors();
            }, function (error) {
                console.error(error);;
                throw error;
            })
        }

        return self;
    }
}());