(function () {
    angular.module('atiendeme').factory("doctorRepository", doctorRepository);
    //Nota: no se extraen los $http para facilitar las tareas de debug.
    function doctorRepository($http) {
        function getDoctors() {
            var url = "/api/Doctor";
            var req = requestBuilder(url, 'GET');

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

        function doctorLaborDays(doctorId, officeId) {
            var url = "/api/DoctorLaborDays/" + doctorId + "/" + officeId;
            var req = requestBuilder(url, 'GET');

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

        function saveDoctor(form) {
            var url = "/api/Doctor";
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

        function updateDoctor(form) {
            var url = "/api/Doctor";
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
        function deleteDoctor(id) {
            var url = "/api/Doctor/" + id;
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
            getDoctors: getDoctors,
            saveDoctor: saveDoctor,
            updateDoctor: updateDoctor,
            deleteDoctor: deleteDoctor,
            doctorLaborDays: doctorLaborDays
        };
    }
}());