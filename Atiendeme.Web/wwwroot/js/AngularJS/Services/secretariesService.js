(function () {
    angular.module('atiendeme').service("secretariesService", secretariesService);

    function secretariesService(secretariesRepository, $rootScope, $q) {
        var self = this;

        self.secretaries = [];
        self.saveSecretary = saveSecretary;
        self.getSecretaries = getSecretaries;
        self.deleteSecretary = deleteSecretary;
        initializeService();

        function initializeService() {
        }

        function getSecretaries() {
            return secretariesRepository.getSecretaries().then(function (response) {
                self.secretaries = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function saveSecretary(form) {
            var secretaryDoctors = [];

            form.doctors.forEach(x => {
                secretaryDoctors.push({
                    doctorId: x.id,
                    since: x.since || moment().format("YYYY-MM-DD")
                });
            })

            var _form = {
                ...form,
                secretaryDoctors
            }

            delete _form.doctors;

            if (!_form.id) {
                return secretariesRepository.saveSecretary(_form).then(function (response) {
                    return getSecretaries();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            } else {
                return secretariesRepository.updateSecretary(_form).then(function (response) {
                    return getSecretaries();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            }
        }

        function deleteSecretary(id) {
            return secretariesRepository.deleteSecretary(id).then(function (response) {
                return getSecretaries();
            }, function (error) {
                console.error(error);;
                throw error;
            })
        }
        return self;
    }
}());