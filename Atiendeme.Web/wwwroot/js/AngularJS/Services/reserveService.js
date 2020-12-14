(function () {
    angular.module('atiendeme').service("reserveService", reserveService);

    function reserveService(reserveRepository, $rootScope, $q) {
        var self = this;

        self.saveReserve = saveReserve;
        initializeService();

        function initializeService() {
        }

        function saveReserve(form, currentUserId) { 
            var _form = {
                id: form.id,
                doctorId: form.doctor.id,
                officeId: form.office.id,
                startTime: moment(form.date + "T" + form.startTime, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm"),
                endTime: moment(form.date + "T" + form.endTime,"DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm"),
                patientId: currentUserId,
                State: "Pendiente",
                specialtyId: form.specialty.id
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

        return self;
    }
}());