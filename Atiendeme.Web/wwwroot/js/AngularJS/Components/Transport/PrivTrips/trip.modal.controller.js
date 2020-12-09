/* @ngInject */
import 'jquery';

class tripModalController {

    constructor($scope, expenseRepository, googleDistanceAPIRepository, cardnetRepository, messageService, notificationService, config) {

        this.$scope = $scope;
        this.expenseRepository = expenseRepository;
        this.googleDistanceAPIRepository = googleDistanceAPIRepository;
        this.cardnetRepository = cardnetRepository;

        //Common
        this.messageService = messageService;
        this.notificationService = notificationService;
        this.config = config;
        //
        this.context = {
            //tripDatesOnConflict: false,
            privateTripItem: {
                usedVehicle: "",

                fromLocation: {
                    latitude: "",
                    ID: "",
                    longitude: "",
                    name: ""
                },
                untilLocation: {
                    latitude: "",
                    ID: "",
                    longitude: "",
                    name: ""
                },
                //
                fromDate: "",
                momentFromDate: null,

                untilDate: "",
                momentUntilDate: null,
                //
                //
                invoice: {
                    rnc: "",
                    ncf: "",
                    supplier: ""
                },
                //
                traveledDistance: "",
                tripCost: "",
                tripCostPerKm: "",
                //
                haveLodgement: false,
                haveInvoice: false,
                lodgement: {
                    invoice: {
                        rnc: "",
                        ncf: "",
                        supplier: ""
                    },
                    lodgementTotalCost: "",
                    lodgementCost: "",
                    lodgementDaysQuantity: "",
                    lodgementName: "",
                    lodgementType: ""
                }
            },
            //User first click on button
            firstClick: false,
            invalidNCF: false,
            invalidLodgementNCF: false,
            lastNCFSearch: {}
        };

    }

    //#region Setup
    $onInit() {
        this.setUpBroadcasters();
    }

    setUpBroadcasters() {
        //Call modal from parent
        this.$scope.$on("showPrivateTripModal", (evt, request) => {
            this.showPrivateTripModal();
        });

        this.$scope.$on("editPrivateTrip", (evt, request) => {
            this.editTrip(request.trip, request.index);
        });

        this.$scope.$on("deletePrivateTrip", (evt, request) => {
            this.deleteTrip(request.trip, request.index);
        });

    }

    //#endregion

    //#region CRUD
    showPrivateTripModal() {
        this.resetPrivateVehicleModal();
        $('#private-trip-modal').modal('show');
    }

    closePrivateTripModal() {
        $('#private-trip-modal').modal('hide');
    }

    addPrivateTrip() {

        if (this.privateTripForm.$valid) {

            if (this.context.privateTripItem.inEdit) {


                if (this.context.privateTripItem.haveInvoice) {

                    if (!this.context.privateTripItem.invoice.uniqueID)
                        this.context.privateTripItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();

                    this.$scope.$emit("editInvoiceInArray", this.context.privateTripItem.invoice, "Transporte Privado");
                } else {
                    if (this.context.privateTripItem.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.privateTripItem.invoice);
                }

                if (this.context.privateTripItem.haveLodgement) {

                    if (!this.context.privateTripItem.lodgement.invoice.uniqueID)
                        this.context.privateTripItem.lodgement.invoice.uniqueID = this.expenseRepository.generateUniqueID();

                    this.$scope.$emit("editInvoiceInArray", this.context.privateTripItem.lodgement.invoice, "Hospedaje");
                } else {
                    if (this.context.privateTripItem.lodgement.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.privateTripItem.lodgement.invoice);
                }

                this.expenseRepository.expenseRequest.privateTrips =
                    this.expenseRepository.expenseRequest.privateTrips.map(_abs => {

                        if (_abs.inEdit) {
                            delete this.context.privateTripItem.inEdit;
                            delete this.context.privateTripItem.index;
                            return this.context.privateTripItem;
                        }
                        else
                            return _abs;
                    });
            }
            else {

                //
                if (this.context.privateTripItem.haveInvoice) {
                    this.context.privateTripItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();
                    this.$scope.$emit("addInvoiceToArray", this.context.privateTripItem.invoice, "Transporte Privado");
                } else {
                    if (this.context.privateTripItem.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.privateTripItem.invoice);

                }
                //
                if (this.context.privateTripItem.haveLodgement) {
                    this.context.privateTripItem.lodgement.invoice.uniqueID = this.expenseRepository.generateUniqueID();
                    this.$scope.$emit("addInvoiceToArray", this.context.privateTripItem.lodgement.invoice, "Hospedaje");
                } else {
                    if (this.context.privateTripItem.lodgement.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.privateTripItem.lodgement.invoice);
                }

                this.expenseRepository.expenseRequest.privateTrips =
                    this.expenseRepository.expenseRequest.privateTrips.concat(this.context.privateTripItem);
            }
            this.$scope.$emit("calculateExpense", {});
            this.closePrivateTripModal();

        } else {
            this.setFormInputDirty(this.privateTripForm);
            this.context.firstClick = true;
        }

    }

    editTrip(_trip, index) {
        //Set the object in the array on edit
        _trip.inEdit = true;

        this.context.privateTripItem = angular.copy(_trip);
        this.context.privateTripItem.index = index;

        this.context.privateTripItem.usedVehicle = this.expenseRepository.expenseRequest.privateVehicles.find(_veh => { return _veh.vehiclePlate === this.context.privateTripItem.usedVehicle.vehiclePlate; }) || this.context.privateTripItem.usedVehicle;
        $('#private-trip-modal').modal('show');
    }

    resetPrivateVehicleModal() {
        this.context.privateTripItem = {
            usedVehicle: "",

            fromLocation: {
                latitude: "",
                ID: "",
                longitude: "",
                name: ""
            },
            untilLocation: {
                latitude: "",
                ID: "",
                longitude: "",
                name: ""
            },
            //
            fromDate: "",
            momentFromDate: null,

            untilDate: "",
            momentUntilDate: null,
            //

            traveledDistance: "",
            tripCost: "",
            tripCostPerKm: "",
            //
            invoice: {
                rnc: "",
                ncf: "",
                supplier: "",
                uniqueID: ""
            },
            //
            //
            haveLodgement: false,
            lodgement: {
                invoice: {
                    rnc: "",
                    ncf: "",
                    supplier: "",
                    uniqueID: ""
                },
                lodgementTotalCost: "",
                lodgementCost: "",
                lodgementDaysQuantity: "",
                lodgementName: "",
                lodgementType: ""
            }
        };
        //set touched || Reset form
        this.privateTripForm.$setUntouched();
        this.privateTripForm.$setPristine();
        this.context.firstClick = false;
    }

    deleteTrip(_trip, index) {


        this.notificationService.showConfirmationSwal(
            '¿Está seguro de querer eliminar este viaje privado?',
            "Esta información no podra ser recuperada.",
            'warning',
            true,
            "Cancelar",
            "Eliminar")
            .then((result) => {

                if (result) {

                    if (_trip.ID || _trip.Id)
                        _trip.deleted = true;
                    else
                        this.expenseRepository.expenseRequest.privateTrips.splice(index, 1);

                    //get throw array and find at least one that does not have logical deleted
                    this.context.allTripsHaveLogicalDeleted = this.expenseRepository.expenseRequest.privateTrips.find(_abs => {
                        return !_abs.deleted;
                    }) ? true : false;

                    //Diggest have to be applied because SweetAlert is not in the angular context

                    this.$scope.$emit("calculateExpense", {});

                    //Update Invoices available
                    if (_trip.haveInvoice)
                        this.$scope.$emit("deleteInvoiceInArray", _trip.invoice);

                    //Lodgement invoice
                    if (_trip.haveLodgement)
                        this.$scope.$emit("deleteInvoiceInArray", _trip.lodgement.invoice);


                    this.messageService.getMessageAndShowToastr("Success - Eliminar Viaje Privado");


                    this.$scope.$apply();

                }
            });


    }

    //#endregion

    //#region LOGIC

    datesValidator() {
        this.$scope.$emit("validaTripDate", this.context.privateTripItem);
    }

    calculatedNewCostAndDistance(model) {
        this.$scope.$emit("calculatedTripCostAndDistance", this.context.privateTripItem, model);
    }

    calculateLodgementCost() {
        let lodgementCost = parseFloat(this.context.privateTripItem.lodgement.lodgementCost) || 0;
        let lodgementDaysQuantity = parseFloat(this.context.privateTripItem.lodgement.lodgementDaysQuantity) || 0;
        this.context.privateTripItem.lodgement.lodgementTotalCost = lodgementCost * lodgementDaysQuantity || "";
    }

    cleanLodgementInfo() {

        this.context.firstClick = false;
        this.context.privateTripItem.lodgement = {
            invoice: {
                uniqueID: this.context.privateTripItem.lodgement.invoice.uniqueID
            }
        };
        this.privateTripForm.$setUntouched();
        this.privateTripForm.$setPristine();
    }

    cleanInvoiceInfo() {

        this.context.firstClick = false;
        this.context.privateTripItem.invoice = {
            uniqueID: this.context.privateTripItem.invoice.uniqueID || ""
        };

        this.context.privateTripItem.tripCost = 0;
        this.privateTripForm.$setUntouched();
        this.privateTripForm.$setPristine();
    }


    //#endregion

    //#region Tools -MOVE

    setFormInputDirty(form) {
        angular.forEach(form.$error,
            controls =>
                controls.forEach(control =>
                    control.$setDirty()
                ));
    }

    //#endregion

    //NCF Validation REFACTORING PENDING

    validateNCF() {

        //This prevent re-search
        if (this.context.privateTripItem.invoice.rnc && this.context.privateTripItem.invoice.ncf
            && (this.context.lastNCFSearch.rnc !== this.context.privateTripItem.invoice.rnc
                || this.context.lastNCFSearch.ncf !== this.context.privateTripItem.invoice.ncf)) {

            if (this.context.privateTripItem.lodgement.invoice.rnc === this.context.privateTripItem.invoice.rnc && this.context.privateTripItem.lodgement.invoice.ncf === this.context.privateTripItem.invoice.ncf) {
                this.context.invalidLodgementNCF = true;

                this.messageService.getMessageAndShowToastr("Error - RNC y NCF Repetidos");
            } else {

                this.context.lastNCFSearch = { rnc: this.context.privateTripItem.invoice.rnc.trim(), ncf: this.context.privateTripItem.invoice.ncf.trim() };

                this.cardnetRepository.validateNCF(this.context.lastNCFSearch).then(response => {

                    if (response.data.isValid) {
                        if (response.data.existInList) {

                            //We search if the ncf and rnc combination is alredy in use, if not, we use it.
                            let search = this.expenseRepository.validateNCFIsNotInUse(this.context.lastNCFSearch.rnc, this.context.lastNCFSearch.ncf);

                            if (search.isRepeated) {
                                this.context.privateTripItem.invoice.supplier = "";
                                this.context.invalidNCF = true;
                                this.notificationService.showToast(`Esta combinación de RNC y NCF ha sido utilizada en el segmento de: ${search.location}.`, "", "error");
                            } else {
                                this.context.invalidNCF = false;
                                this.context.privateTripItem.invoice.supplier = response.data.razonSocial;
                            }

                        } else {

                            this.context.privateTripItem.invoice.supplier = "";
                            this.context.invalidNCF = true;

                            this.messageService.getMessageAndShowToastr("Error - NCF o RNC Repetido En Lista");
                        }
                    } else {
                        this.context.privateTripItem.invoice.supplier = "";
                        this.context.invalidNCF = true;

                        this.messageService.getMessageAndShowToastr("Error - NCF o RNC");


                    }
                }, error => {
                    console.error(error);
                    this.context.invalidNCF = false;
                    this.context.privateTripItem.invoice.supplier = "";
                   
                    this.messageService.getMessageAndShowToastr("Error - Desconocido", true, error);

                });
            }
        }
    }

    validateNCFLodgement() {

        //This prevent re-search
        if (this.context.privateTripItem.lodgement.invoice.rnc && this.context.privateTripItem.lodgement.invoice.ncf) {


            if (this.context.privateTripItem.lodgement.invoice.rnc === this.context.privateTripItem.invoice.rnc && this.context.privateTripItem.lodgement.invoice.ncf === this.context.privateTripItem.invoice.ncf) {
                this.context.invalidLodgementNCF = true;
                this.context.privateTripItem.lodgement.invoice.supplier = "";

                this.messageService.getMessageAndShowToastr("Error - RNC y NCF Repetidos");
            } else {

                this.context.lastNCFSearch = { rnc: this.context.privateTripItem.lodgement.invoice.rnc.trim(), ncf: this.context.privateTripItem.lodgement.invoice.ncf.trim() };

                this.cardnetRepository.validateNCF(this.context.lastNCFSearch).then(response => {

                    if (response.data.isValid) {
                        if (response.data.existInList) {
                            //We search if the ncf and rnc combination is alredy in use, if not, we use it.
                            let search = this.expenseRepository.validateNCFIsNotInUse(this.context.lastNCFSearch.rnc, this.context.lastNCFSearch.ncf);

                            if (search.isRepeated) {
                                this.context.privateTripItem.lodgement.invoice.supplier = "";
                                this.context.invalidLodgementNCF = true;
                                this.notificationService.showToast(`Esta combinación de RNC y NCF ha sido utilizada en el segmento de: ${search.location}.`, "", "error");

                            } else {
                                this.context.invalidLodgementNCF = false;
                                this.context.privateTripItem.lodgement.invoice.supplier = response.data.razonSocial;
                            }

                        } else {
                            this.context.privateTripItem.lodgement.invoice.supplier = "";
                            this.context.invalidLodgementNCF = true;

                            this.messageService.getMessageAndShowToastr("Error - NCF o RNC Repetido En Lista");

                        }
                    } else {

                        this.context.privateTripItem.lodgement.invoice.supplier = "";
                        this.context.invalidLodgementNCF = true;

                        this.messageService.getMessageAndShowToastr("Error - NCF o RNC");

                    }
                }, error => {
                    console.error(error);
                    this.context.invalidLodgementNCF = false;
                    this.context.privateTripItem.lodgement.invoice.supplier = "";

                    this.messageService.getMessageAndShowToastr("Error - Desconocido", true, error);
                });
            }
        }
    }


}


export default tripModalController; 