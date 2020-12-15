(function () {
    angular.module('atiendeme').service("reserveService", reserveService);

    function reserveService(reserveRepository, $rootScope, $q) {
        var self = this;
        self.userReserves = [];
        self.saveReserve = saveReserve;
        self.getCurrentUserReservation = getCurrentUserReservation;
        self.changeReserveStatus = changeReserveStatus;
        self.secretaryReservationList = secretaryReservationList;
        self.doctorReservations = doctorReservations;
        initializeService();

        function initializeService() {
        }

        function saveReserve(form, currentUserId) {
            var _form = {
                id: form.id,
                doctorId: form.doctor.id,
                officeId: form.office.id,
                startTime: moment(form.date + "T" + form.startTime, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm"),
                endTime: moment(form.date + "T" + form.endTime, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm"),
                patientId: currentUserId,
                State: "Pendiente",
                specialtyId: form.specialty.id,
                forDependent: form.forDependent
            }

            if (_form.forDependent && form.dependent != null) {
                _form.DependentId = form.dependent.id;
            }

            if (!_form.id) {
                return reserveRepository.saveReserve(_form).then(function (response) {
                    return response;
                }, function (error) {
                    console.error(error);
                    throw error;
                })
            } else {
                return reserveRepository.updateReserve(_form).then(function (response) {
                    return getOffices();
                }, function (error) {
                    console.error(error);;
                    throw error;
                })
            }
        }

        function getCurrentUserReservation() {
            return reserveRepository.getCurrentUserReservation().then(function (response) {
                self.userReserves = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }
        function doctorReservations(doctorId) {
            return reserveRepository.doctorReservations(doctorId).then(function (response) {
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function secretaryReservationList() {
            return reserveRepository.secretaryReservationList().then(function (response) {
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        function changeReserveStatus(reserveId, state) {
            return reserveRepository.changeReserveStatus(reserveId, state).then(function (response) {
                self.userReserves = response;
                return response;
            }, function (error) {
                console.error(error);;
                throw error;
            });
        }

        return self;
    }
}());