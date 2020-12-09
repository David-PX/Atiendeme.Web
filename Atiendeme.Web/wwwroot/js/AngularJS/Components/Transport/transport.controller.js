/* @ngInject */
import 'jquery';

class transportController {

    constructor($scope, cardnetRepository, expenseRepository, googleDistanceAPIRepository, messageService, notificationService) {

        this.$scope = $scope;
        this.cardnetRepository = cardnetRepository;
        this.googleDistanceAPIRepository = googleDistanceAPIRepository;
        this.expenseRepository = expenseRepository;
        //Common
        this.messageService = messageService;
        this.notificationService = notificationService;
        //
        this.context = {

            allVehiclesHaveLogicalDeleted: false,
            havePrivateTrips: false,
            havePublicTrips: false,

            //
            tripDatesOnConflict: false,

            //
            lodgementTypes: [],

            //Veh
            propertyTypes: [],
            vehicleTypes: [],

            //
            publicVehiclesType: []

        };

    }

    //#regionSetup
    $onInit() {
        this.initialize();
    }

    initialize() {
        this.getDropdowns();
        this.setUpBroadcasters();
    }

    setUpBroadcasters() {
        this.$scope.$on("validaTripDate", (evt, tripItem) => {
            this.datesValidator(tripItem);
        });

        this.$scope.$on("calculatedTripCostAndDistance", (evt, tripItem, model) => {
            this.calculatedTripCostAndDistance(tripItem, model);
        });

        this.$scope.$on("setChecks", (evt) => {
            if (this.expenseRepository.expenseRequest.privateVehicles.length)
                this.context.havePrivateTrips = true;

            if (this.expenseRepository.expenseRequest.publicTrips.length)
                this.context.havePublicTrips = true;
        });
    }

    //#endregion

    //#region GET
    getDropdowns() {

        this.expenseRepository.retrievePropertiesList("SRG-Hospedaje", ["lodgementType"]).then(response => {

            this.context.lodgementTypes = response.data.value[0].Choices;
        }, error => {
            console.error(error);
            this.messageService.getMessageAndShowToastr("Error - Get Dropdowns", true, error); //
        });

        this.expenseRepository.retrievePropertiesList("SRG-Vehiculos", ["vehicleType", "property"]).then(response => {

            let vehicleTypes = response.data.value.find(drop => { return drop.Title === "vehicleType"; });
            this.context.vehicleTypes = vehicleTypes ? vehicleTypes.Choices : [];

            let propertyTypes = response.data.value.find(drop => { return drop.Title === "property"; });
            this.context.propertyTypes = propertyTypes ? propertyTypes.Choices : [];
        }, error => {
            console.error(error);
            this.messageService.getMessageAndShowToastr("Error - Get Dropdowns", true, error); //
        });


        this.expenseRepository.retrievePropertiesList("SRG-Transporte", ["vehicleType"]).then(response => {

            this.context.publicVehiclesType = response.data.value[0].Choices;
        }, error => {
            console.error(error);
            this.messageService.getMessageAndShowToastr("Error - Get Dropdowns", true, error); //
        });

    }

    //#endregion

    //#endregion

    //#region Private Vehicle
    showPrivateVehicleModal() {
        this.$scope.$broadcast("showPrivateVehicleModal", {});
    }

    editPrivateVehicle(vehicle, index) {
        this.$scope.$broadcast("editPrivateVehicle", { vehicle, index });
    }

    deletePrivateVehicle(vehicle, index) {
        this.$scope.$broadcast("deletePrivateVehicle", { vehicle, index });
    }
    //#endregion

    //#region Private Trips 
    showPrivateTripModal() {
        this.$scope.$broadcast("showPrivateTripModal", {});
    }

    editPrivateTrip(trip, index) {
        this.$scope.$broadcast("editPrivateTrip", { trip, index });
    }

    deletePrivateTrip(trip, index) {
        this.$scope.$broadcast("deletePrivateTrip", { trip, index });
    }
    //#endregion

    //#region Public Trips  
    showPublicTripModal() {
        this.$scope.$broadcast("showPublicTripModal", {});
    }

    editPublicTrip(trip, index) {
        this.$scope.$broadcast("editPublicTrip", { trip, index });
    }

    deletePublicTrip(trip, index) {
        this.$scope.$broadcast("deletePublicTrip", { trip, index });
    }
    //#endregion

    //#region Tools

    //Action trigger if user put off the private section chk ||TODO: DO THIS FOR PUBLIC
    confirmDisablePrivateTripsCheck() {

        if (!this.context.havePrivateTrips && this.expenseRepository.expenseRequest.privateVehicles.length) {

            this.notificationService.showConfirmationSwal(
                '¿Está seguro de esto?',
                'Su solicitud cuenta con información que entra en conflicto con las fechas ingresadas, si acepta los cambios esta será removidas.',
                'warning',
                false,
                "Cancelar",
                "Eliminar")
                .then((result) => {

                    if (result) {
                        //Diggest have to be applied because SweetAlert is not in the angular context

                        //CLEAN ALL THE PRIVATE ARRAYS INFO
                        this.deleteAllPrivateTripsInfo();
                    } else {
                        this.context.havePrivateTrips = true;
                        this.$scope.$apply();
                    }
                });
        }
    }

    //
    confirmDisablePublicTripsCheck() {

        if (!this.context.havePublicTrips && this.expenseRepository.expenseRequest.privateVehicles.length) {

            this.notificationService.showConfirmationSwal(
                '¿Está seguro de esto?',
                `De aceptar, se eliminarán  todos los elementos registrados sobre <b>Viajes</b> publicos`, 'warning',
                false,
                "Cancelar",
                "Eliminar")
                .then((result) => {

                    if (result) {
                        //Diggest have to be applied because SweetAlert is not in the angular context

                        //CLEAN ALL THE PRIVATE ARRAYS INFO
                        this.deleteAllPublicTripsInfo();
                    } else {
                        this.context.havePublicTrips = true;
                        this.$scope.$apply();
                    }
                });
        }
    }

    deleteAllPrivateTripsInfo() {

        //Ignore all that are not saved
        this.expenseRepository.expenseRequest.privateVehicles = this.expenseRepository.expenseRequest.privateVehicles.filter(_PVeh => {
            return _PVeh.ID || _PVeh.Id;
        });

        this.expenseRepository.expenseRequest.privateVehicles.forEach(_PVeh => {
            _PVeh.deleted = true;
        });

        //Ignore all that are not saved
        this.expenseRepository.expenseRequest.privateTrips = this.expenseRepository.expenseRequest.privateTrips.filter(_PTrips => {
            return _PTrips.ID || _PTrips.Id;
        });

        this.expenseRepository.expenseRequest.privateTrips.forEach(_PTrips => {
            _PTrips.deleted = true;
        });

        this.$scope.$apply();
        //
        this.$scope.$emit("calculateExpense", {});
        this.messageService.getMessageAndShowToastr("Success - Eliminar Viajes Privado");
    }

    deleteAllPublicTripsInfo() {

        //Ignore all that are not saved
        this.expenseRepository.expenseRequest.publicTrips = this.expenseRepository.expenseRequest.publicTrips.filter(_PTrips => {
            return _PTrips.ID || _PTrips.Id;
        });

        this.expenseRepository.expenseRequest.publicTrips.forEach(_PTrips => {
            _PTrips.deleted = true;
        });

        this.$scope.$apply();

        this.$scope.$emit("calculateExpense", {});

        this.messageService.getMessageAndShowToastr("Success - Eliminar Viajes Publicos");
    }

    calculatedAbsenceDifferentDays() {

        if (this.context.momentsDate.momentUntilDate && this.context.momentsDate.momentFromDate) {
            //Normal diff
            this.context.absenceItem.calendarDaysQuantity = this.context.momentsDate.momentUntilDate.diff(this.context.momentsDate.momentFromDate, "days", false) || 0;
            //Business difference
            this.context.absenceItem.laborDaysQuantity = this.context.momentsDate.momentUntilDate.businessDiff(this.context.momentsDate.momentFromDate) || 0;
        }
    }

    getNextDayAfterFromDate() {
        this.context.fromDatePlusOne = moment(this.context.momentsDate.momentFromDate).add(1, 'days').format("DD/MM/YYYY");
    }

    //#endregion
    collapseLodgementInfo(trip, buttonId) {
        trip.buttonDirection = trip.buttonDirection === 'down' || document.getElementById('collapsed-button-' + buttonId).classList.contains('collapsed') ? 'up' : 'down';
    }

    collapsePublicLodgementInfo(trip, buttonId) {
        trip.buttonDirection = trip.buttonDirection === 'down' || document.getElementById('public-collapsed-button-' + buttonId).classList.contains('collapsed') ? 'up' : 'down';
    }

    collapseVehicleInvoiceInfo(veh, buttonId) {
        veh.buttonDirection = veh.buttonDirection === 'down' || document.getElementById('vehicle-collapsed-button-' + buttonId).classList.contains('collapsed') ? 'up' : 'down';
    }
    /////

    //Check if at least one of the date range added on all the transport trips collapse each other.
    datesValidator(tripItem) {

        this.context.tripDatesOnConflict = false;

        this.expenseRepository.expenseRequest.privateTrips.forEach(_privT => {

            if (tripItem.momentFromDate && tripItem.momentUntilDate && !tripItem.inEdit) {
                //Modal -Int
                if (tripItem.momentFromDate.isBetween(_privT.momentFromDate, _privT.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;

                if (tripItem.momentUntilDate.isBetween(_privT.momentFromDate, _privT.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;


                //Table -Ext
                if (_privT.momentFromDate.isBetween(tripItem.momentFromDate, tripItem.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;

                if (_privT.momentUntilDate.isBetween(tripItem.momentFromDate, tripItem.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;
                //
            }
        });

        this.expenseRepository.expenseRequest.publicTrips.forEach(_privT => {

            if (tripItem.momentFromDate && tripItem.momentUntilDate && !tripItem.inEdit) {
                //Modal -Int
                if (tripItem.momentFromDate.isBetween(_privT.momentFromDate, _privT.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;

                if (tripItem.momentUntilDate.isBetween(_privT.momentFromDate, _privT.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;

                //Table -Ext
                if (_privT.momentFromDate.isBetween(tripItem.momentFromDate, tripItem.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;

                if (_privT.momentUntilDate.isBetween(tripItem.momentFromDate, tripItem.momentUntilDate, null, []))
                    this.context.tripDatesOnConflict = true;
                //
            }
        });


    }



    calculatedTripCostAndDistance(tripItem, model) {
        //First check if both are the same location 

        if (tripItem.fromLocation.ID && tripItem.untilLocation.ID) {

            if (tripItem.fromLocation.ID === tripItem.untilLocation.ID) {

                this.messageService.getMessageAndShowToastr("Error - Origin y Destino");
                tripItem.traveledDistance = 0;
                tripItem.tripCostPerKm = 0;
                tripItem[model] = {};
            } else {

                this.googleDistanceAPIRepository.getGoogleDistanceByLatitudeAndLongitude(tripItem.fromLocation, tripItem.untilLocation)
                    .then(response => {
                        //NOTES: This is outside Angular Scope, we have to do an apply after 
                        if (response.routes.length) {

                            tripItem.traveledDistance = parseFloat(response.routes[0].legs[0].distance.text.split(" km")[0]);

                            tripItem.tripCostPerKm = tripItem.traveledDistance * this.expenseRepository.expenseRequest.request.gasolineCost;

                        } else {
                            tripItem.traveledDistance = 0;
                            tripItem.tripCostPerKm = 0;
                            this.messageService.getMessageAndShowToastr("Error - No Rutas");

                        }

                        this.$scope.$apply();

                    }, error => {
                        tripItem.traveledDistance = 0;
                        tripItem.tripCostPerKm = 0;
                        this.messageService.getMessageAndShowToastr("Error - Busqueda Distancias API", true, error);

                        tripItem[model] = {};
                        this.$scope.$apply();
                    });
            }
        }
    }


}


export default transportController; 