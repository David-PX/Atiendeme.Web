(function () {
    angular.module('atiendeme').service("reserveService", reserveService);

    function reserveService(officeRepository, $rootScope, $q) {
        var self = this;

        self.offices = [];
        self.saveOffice = saveOffice;
        self.getOffices = getOffices;
        self.deleteOffice = deleteOffice;
        initializeService();

        function initializeService() {
            var promises = [];

            promises.push(getOffices());

            $q.all(promises).then(function (response) {
                $rootScope.$broadcast('officesServiceLoaded', self.context);
            },
                function (error) {
                    console.error(error);
                });
        }

        function getOffices() {
            return officeRepository.getOffices().then(function (response) {
                self.offices = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function saveOffice(form) {
            if (!form.id) {
                return officeRepository.saveOffice(form).then(function (response) {
                    return getOffices();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            } else {
                return officeRepository.updateOffice(form).then(function (response) {
                    return getOffices();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            }
        }

        function deleteOffice(id) {
            return officeRepository.deleteOffice(id).then(function (response) {
                return getOffices();
            }, function (error) {
                console.error(error);;
                throw error;
            })
        }
        return self;
    }
}());