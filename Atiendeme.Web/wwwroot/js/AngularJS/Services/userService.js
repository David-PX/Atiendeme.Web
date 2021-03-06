﻿//SERVICIO DE MENSAJES
(function () {
    angular.module('atiendeme').service("userService", userService);

    function userService(userRepository, $rootScope, $q) {

        var self = this;

        self.context = {
            currentUser: {}
        }

        initializeService();

       function initializeService() {
            
           var promises = [];

           promises.push(getCurrentUser());

            $q.all(promises).then(function(response) {
                $rootScope.$broadcast('userServiceLoaded', self.context); 
             },
            function(error)  {
                console.error(error);
            });
                   
        }

        function getCurrentUser() {
            return userRepository.getCurrentUser().then(function (response) {
                self.context.currentUser = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        //move to util
        //function defaultQueueResolve(responses, objectToReturnOnSuccess) {

        //    let isGood = true;
        //    let errors = [];

        //    for (var i = 0; i < responses.length; i++) {
        //        if (responses[i].status > 205) {
        //            isGood = false;
        //            errors.push(responses[i]);
        //        }
        //    }

        //    if (isGood)
        //        return objectToReturnOnSuccess;
        //    else
        //        throw {
        //            errors,
        //            status: 500
        //        };
        //}
         
        return {
            context: self.context
        };
    }
}());