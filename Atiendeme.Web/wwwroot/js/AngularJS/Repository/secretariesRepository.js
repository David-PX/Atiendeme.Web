(function () {
    angular.module('atiendeme').factory("secretariesRepository", secretariesRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function secretariesRepository($http) {
        function getSecretaries() {
            var url = "/api/Secretary";
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

        function saveSecretary(form) {
            var url = "/api/Secretary";
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

        function updateSecretary(form) {
            var url = "/api/Secretary";
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
        function deleteSecretary(id) {
            var url = "/api/Secretary/" + id;
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
            getSecretaries: getSecretaries,
            saveSecretary: saveSecretary,
            updateSecretary: updateSecretary,
            deleteSecretary: deleteSecretary
        };
    }
}());