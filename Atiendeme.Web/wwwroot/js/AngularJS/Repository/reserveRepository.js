(function () {
    angular.module('atiendeme').factory("reserveRepository", reserveRepository);
    function reserveRepository($http) {
        function saveReserve(form) {
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
            saveReserve: saveReserve
        };
    }
}());