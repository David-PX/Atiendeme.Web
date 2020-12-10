(function () {
    angular.module('atiendeme').factory("userRepository", userRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function userRepository($http) {
        function getCurrentUser() {
         
            var url = "/api/User";
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
            getCurrentUser: getCurrentUser
        };
    }
}());