(function () {
    angular.module('atiendeme').factory("reserveRepository", reserveRepository);
    function reserveRepository($http) {
        self.userReservation = [];
        function saveReserve(form) {
            var url = "/api/Reservation";
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

        function getCurrentUserReservation() {
            var url = "/api/Reservation/CurrentUserReservation";
            var req = requestBuilder(url);

            return $http(req).then(
                function (response) {
                    if (response.status < 205) {
                        self.userReservation = response.data
                        return response.data;
                    }
                    else
                        throw response;
                }, function (error) {
                    throw error;
                });
        }

        function secretaryReservationList() {
            var url = "/api/Reservation/SecretaryReservationList";
            var req = requestBuilder(url);

            return $http(req).then(
                function (response) {
                    if (response.status < 205) {
                        self.userReservation = response.data
                        return response.data;
                    }
                    else
                        throw response;
                }, function (error) {
                    throw error;
                });
        }

        function changeReserveStatus(reserveId, state) {
            var url = "/api/Reservation/ChangeReserveStatus";
            var req = requestBuilder(url, 'PATCH', {
                state: state,
                reserveId: reserveId
            });

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
            saveReserve: saveReserve,
            getCurrentUserReservation: getCurrentUserReservation,
            changeReserveStatus: changeReserveStatus,
            secretaryReservationList: secretaryReservationList
        };
    }
}());