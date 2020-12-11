//SERVICIO DE MENSAJES
(function () {
    angular.module('atiendeme').service("specialtiesService", specialtiesService);

    function specialtiesService(specialtiesRepository, $rootScope, $q) {
        var self = this;

        self.specialties = [];
        self.saveSpecialties = saveSpecialties;
        self.getSpecialties = getSpecialties;
        self.deleteSpecialties = deleteSpecialties;
        initializeService();

        function initializeService() {
            var promises = [];

            promises.push(getSpecialties());

            $q.all(promises).then(function (response) {
                $rootScope.$broadcast('specialtiesServiceLoaded', self.context);
            },
                function (error) {
                    console.error(error);
                });
        }

        function getSpecialties() {
            return specialtiesRepository.getSpecialties().then(function (response) {
                self.specialties = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function saveSpecialties(form) {

            if (!form.id) {
                return specialtiesRepository.saveSpecialties(form).then(function (response) {
                    return getSpecialties();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            } else {
                return specialtiesRepository.updateSpecialties(form).then(function (response) {
                    return getSpecialties();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })

            }

        }

        function deleteSpecialties(id) {
            return specialtiesRepository.deleteSpecialties(id).then(function (response) {
                return getSpecialties();
            }, function (error) {
                console.error(error);;
                throw error;
            })
        }
        return self;
    }
}());