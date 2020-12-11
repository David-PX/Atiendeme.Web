﻿(function () {
    angular.module('atiendeme').factory("doctorRepository", doctorRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function doctorRepository($http) {
        function getDoctors() {
            var url = "/api/Doctor";
            var req = requestBuilder(url);

            return $http(req).then(
                function (response) {
                    if (response.status < 205)
                        return response.data;
                    else
                        throw response;
                }, function (error) {
                    throw error;
                });
        }

        function requestBuilder(_url) {
            var req = {
                method: 'GET',
                url: _url,
                headers: {
                    "accept": "application/json;odata=verbose"
                }
            };
            return req;
        }

        return {
            getDoctors: getDoctors
        };
    }
}());