(function () {
    var appName = "atiendeme";
    angular.module(appName).controller("reserveController", reserveController);

    function reserveController($timeout, $scope, doctorService, specialtiesService, reserveService, userService, dependentService, officeService, notificationService) {
        var self = this;

        self.resetForm = resetForm;
        self.reserveForm = {
            date: "",
            doctor: "",
            endTime: "",
            office: "",
            specialty: "",
            startTime: ""
        };

        self.times = [
            { time: "00:00", active: false,busy: false, selected: false, order: 0 },
            { time: "00:30", active: false,busy: false, selected: false, order: 1 },
            { time: "01:00", active: false,busy: false, selected: false, order: 2 },
            { time: "01:30", active: false,busy: false, selected: false, order: 3 },
            { time: "02:00", active: false,busy: false, selected: false, order: 4 },
            { time: "02:30", active: false,busy: false, selected: false, order: 5 },
            { time: "03:00", active: false,busy: false, selected: false, order: 6 },
            { time: "03:30", active: false,busy: false, selected: false, order: 7 },
            { time: "04:00", active: false,busy: false, selected: false, order: 8 },
            { time: "04:30", active: false,busy: false, selected: false, order: 9 },
            { time: "05:00", active: false,busy: false, selected: false, order: 10 },
            { time: "05:30", active: false,busy: false, selected: false, order: 11 },
            { time: "06:00", active: false,busy: false, selected: false, order: 12 },
            { time: "06:30", active: false,busy: false, selected: false, order: 13 },
            { time: "07:00", active: false,busy: false, selected: false, order: 14 },
            { time: "07:30", active: false,busy: false, selected: false, order: 15 },
            { time: "08:00", active: false,busy: false, selected: false, order: 16 },
            { time: "08:30", active: false,busy: false, selected: false, order: 17 },
            { time: "09:00", active: false,busy: false, selected: false, order: 18 },
            { time: "09:30", active: false,busy: false, selected: false, order: 19 },
            { time: "10:00", active: false,busy: false, selected: false, order: 20 },
            { time: "10:30", active: false,busy: false, selected: false, order: 21 },
            { time: "11:00", active: false,busy: false, selected: false, order: 22 },
            { time: "11:30", active: false,busy: false, selected: false, order: 23 },
            { time: "12:00", active: false,busy: false, selected: false, order: 24 },
            { time: "12:30", active: false,busy: false, selected: false, order: 25 },
            { time: "13:00", active: false,busy: false, selected: false, order: 26 },
            { time: "13:30", active: false,busy: false, selected: false, order: 27 },
            { time: "14:00", active: false,busy: false, selected: false, order: 28 },
            { time: "14:30", active: false,busy: false, selected: false, order: 29 },
            { time: "15:00", active: false,busy: false, selected: false, order: 30 },
            { time: "15:30", active: false,busy: false, selected: false, order: 31 },
            { time: "16:00", active: false,busy: false, selected: false, order: 32 },
            { time: "16:30", active: false,busy: false, selected: false, order: 33 },
            { time: "17:00", active: false,busy: false, selected: false, order: 34 },
            { time: "17:30", active: false,busy: false, selected: false, order: 35 },
            { time: "18:00", active: false,busy: false, selected: false, order: 36 },
            { time: "18:30", active: false,busy: false, selected: false, order: 37 },
            { time: "19:00", active: false,busy: false, selected: false, order: 38 },
            { time: "19:30", active: false,busy: false, selected: false, order: 39 },
            { time: "20:00", active: false,busy: false, selected: false, order: 40 },
            { time: "20:30", active: false,busy: false, selected: false, order: 41 },
            { time: "21:00", active: false,busy: false, selected: false, order: 42 },
            { time: "21:30", active: false,busy: false, selected: false, order: 43 },
            { time: "22:00", active: false,busy: false, selected: false, order: 44 },
            { time: "22:30", active: false,busy: false, selected: false, order: 45 },
            { time: "23:00", active: false,busy: false, selected: false, order: 46 },
            { time: "23:30", active: false,busy: false, selected: false, order: 47 },
        ]

        //#region public members

        //#endregion public members
        initialize();

        function initialize() {
            self.stepper = new Stepper($('.bs-stepper')[0])

            self.userService = userService;
            self.officeService = officeService;
            self.specialtiesService = specialtiesService;
            //
            self.dependentService = dependentService;
            self.dependentService.getDependentFromCurrentUser();
            //
            self.reserveService = reserveService;
        }

        self.next = function () {
            self.stepper.next();
        }

        self.back = function () {
            self.stepper.previous();
        }


        self.getDoctorsWithParameters = function () {
             
            if (self.reserveForm.specialty != null && self.reserveForm.office != null && self.reserveForm.date) {

                self.doctors = self.userService.doctors.filter(function (doctor) {

                    var doctorWorkOnThisDay = doctor.doctorLaborDays.find(x => x.day.toLowerCase() === moment(self.reserveForm.date, "DD/MM/YYYY").format("dddd").toLowerCase()) ? true : false;

                    var doctorWorkInThisOffice = doctor.offices.find(x => x.id == self.reserveForm.office.id) ? true : false;

                    var doctorHaveThisSpecialty = doctor.specialties.find(x => x.id === self.reserveForm.specialty.id) ? true : false;
                     
                    return doctorWorkInThisOffice && doctorWorkOnThisDay && doctorHaveThisSpecialty;
                })
              
                resetTimes();
            }
        }

        function resetTimes() {
            self.times.forEach(function (time) {
                time.active =  false;
                time.busy = false;
                time.selected = false;
            }); 
            self.reserveForm.startTime = "";
            self.reserveForm.endTime = "";
        }


        self.doctorLaborDays = doctorLaborDays;
        function doctorLaborDays() {
            if (self.reserveForm.doctor != null && self.reserveForm.office != null && self.reserveForm.date) {
                doctorService.doctorAvailability(self.reserveForm.doctor.id, self.reserveForm.office.id, self.reserveForm.date)
                    .then(function (response) {

                        var doctorLaborDays = self.reserveForm.doctor.doctorLaborDays.filter(x => x.officeId === self.reserveForm.office.id)
                     
                        self.times.forEach(function (time) {
                             
                            time.active = doctorLaborDays.find(function (_doctorDays) {
                              return isInRange(_doctorDays.day, _doctorDays.startTime, _doctorDays.endTime, time.time, moment(self.reserveForm.date, "DD/MM/YYYY").format("dddd"));

                            }) ? true : false;
                             
                            time.busy = response.find(function (_busyDays) {
                                var startValue = moment(moment(_busyDays.startTime, "YYYY-MM-DDTHH:mm").format("HH:mm"), "HH:mm");
                                var endValue = moment(moment(_busyDays.endTime, "YYYY-MM-DDTHH:mm").format("HH:mm"), "HH:mm");

                                return isInRangeWithoutDay(startValue, endValue, time.time)
                            }) ? true: false;
                        }); 

                }) 
            }
        }

        self.timeClicked = function (time) {
            var founded = false;
            self.times.forEach((_time, index) => {

                if (_time.time == time.time) {
                    _time.selected = true;
                    founded = true;
                    self.reserveForm.startTime = time.time;
                    self.reserveForm.endTime = self.times[index + 1].time;
                } else {
                    _time.selected = false;
                }

            });
            self.timeSelected = founded;
        }

        function isInRange(dayValue, startValue, endValue, startRange, dayRange) {
            var inRange =
                dayValue.toLowerCase() === dayRange.toLowerCase() &&
                moment(startRange, "hh:mm").isBetween(moment(startValue, "hh:mm"), moment(endValue, "hh:mm"), undefined, "[)")
            return inRange;
        }

        function isInRangeWithoutDay(startValue, endValue, startRange) {
 
            var inRange =
                moment(startRange, "HH:mm").isBetween(startValue, endValue, undefined, "[)")
            return inRange;
        }

        self.saveReserve = function () {

            reserveService.saveReserve(self.reserveForm, self.userService.currentUser.id)
                .then(function (response) {
                    self.finalText = moment(self.reserveForm.date, "DD/MM/YYYY").format("DD [de] MMMM [del] YYYY hh:mm a") + ' A ' + moment(self.reserveForm.endTime, "HH:mm").format("hh:mma")  
                    self.next(); 
                });  
        }
        function resetForm(){
            self.reserveForm = {
                date: "",
                doctor: "",
                endTime: "",
                office: "",
                specialty: "",
                startTime: "",
                forDependent: false,
                dependent: ""
            };
            resetTimes();
            self.stepper.reset();

            this.firstStep.$setUntouched();
            this.firstStep.$setPristine();
             
        }

        self.resetStepTwo = function () {
            self.reserveForm.endTime = "";
            self.reserveForm.startTime = "";
            self.reserveForm.doctor = "";
            self.reserveForm.date = ""; 
            resetTimes();
        }

        function applyAndSetDirtyForm(waitFormDiggest) {
            //This method wait a little for ng-required to be $$phase in the scope
            $timeout(() => {
                if (waitFormDiggest)
                    applyAndSetDirtyForm();
                else
                    setFormInputDirty(self.officeForm);
            }, 100);
        }

        function setFormInputDirty(form) {
            angular.forEach(form.$error,
                controls =>
                    controls.forEach(control =>
                        control.$setDirty()
                    ));
        }
    }
})();