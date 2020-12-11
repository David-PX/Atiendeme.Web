(function () {
    angular.module('atiendeme').factory("specialtiesRepository", specialtiesRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function specialtiesRepository($http) {
        function getSpecialties() {
            var url = "/api/Specialties";
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

        function saveSpecialties(form) {
            var url = "/api/Specialties";
            var req = requestBuilder(url, 'POST', form);

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

        function updateSpecialties(form) {
            var url = "/api/Specialties";
            var req = requestBuilder(url, 'PATCH', form);

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
        function deleteSpecialties(id) {
            var url = "/api/Specialties/" + id;
            var req = requestBuilder(url, 'DELETE');

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

        //move to tools
        function requestBuilder(_url, _method, form) {
            var req = {
                method: _method || 'GET',
                url: _url,
                headers: {
                    "accept": "application/json;odata=verbose"
                }
            };

            if (form)
                req.data = form;

            return req;
        }

        return {
            getSpecialties: getSpecialties,
            saveSpecialties: saveSpecialties,
            updateSpecialties: updateSpecialties,
            deleteSpecialties: deleteSpecialties
        };
    }
}());