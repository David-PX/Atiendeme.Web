(function () {
    angular.module('atiendeme').factory("dependentRepository", dependentRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function dependentRepository($http) {

        function getDependent() {
            var url = "/api/Patient";
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


        function getDependentFromCurrentUser() {
            var url = "/api/Patient/CurrentUserDependendents";
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
         
        function saveDependent(form) {
            var url = "/api/Patient/Dependent";
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

        function updateDependent(form) {
            var url = "/api/Patient/Dependent";
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
        function deleteDependent(id) {
            var url = "/api/Patient/Dependent/" + id;
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
            getDependent: getDependent,
            saveDependent: saveDependent,
            updateDependent: updateDependent,
            deleteDependent: deleteDependent,
            getDependentFromCurrentUser: getDependentFromCurrentUser
        };
    }
})();