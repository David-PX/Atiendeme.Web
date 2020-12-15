//SERVICIO DE MENSAJES
(function () {
    angular.module('atiendeme').service("dependentService", dependentService);

    function dependentService(dependentRepository, $rootScope, $q) {
        var self = this;

        self.dependent = [];
        self.currentUserDependents = [];
        self.saveDependent = saveDependent;
        self.getDependent = getDependent;
        self.deleteDependent = deleteDependent;
        self.getDependentFromCurrentUser = getDependentFromCurrentUser;
        initializeService();

        function initializeService() {
          
        }

        function getDependent() {
            return dependentRepository.getDependent().then(function (response) {
                self.dependent = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function getDependentFromCurrentUser() {
            return dependentRepository.getDependentFromCurrentUser().then(function (response) {
                self.currentUserDependents = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function saveDependent(form) {

            if (!form.id) {
                return dependentRepository.saveDependent(form).then(function (response) {
                    return getDependentFromCurrentUser();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            } else {
                return dependentRepository.updateDependent(form).then(function (response) {
                    return getDependentFromCurrentUser();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })

            }

        }

        function deleteDependent(id) {
            return dependentRepository.deleteDependent(id).then(function (response) {
                return getDependent();
            }, function (error) {
                console.error(error);;
                throw error;
            })
        }
        return self;
    }
}());