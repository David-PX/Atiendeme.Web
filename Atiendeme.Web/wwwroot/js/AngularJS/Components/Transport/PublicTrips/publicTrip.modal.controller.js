/* @ngInject */
import 'jquery';

class publicTripModalController {

    constructor($scope, expenseRepository, cardnetRepository, messageService, notificationService, config) {

        this.$scope = $scope;
        this.expenseRepository = expenseRepository;
        this.cardnetRepository = cardnetRepository;
        //Common
        this.messageService = messageService;
        this.notificationService = notificationService;
        this.config = config;
        //
        this.context = {
            publicTripItem: {
                vehicleType: "",

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
                company: "",//
                //
                invoice: {
                    rnc: "",
                    ncf: "",
                    supplier: ""
                },
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

    //#regionSetup
    $onInit() {
        this.setUpBroadcasters();
    }

    //Move to directives

    setUpBroadcasters() {
        //Call modal from parent
        this.$scope.$on("showPublicTripModal", (evt, request) => {
            this.showPublicTripModal();
        });

        this.$scope.$on("editPublicTrip", (evt, request) => {
            this.editTrip(request.trip, request.index);
        });

        this.$scope.$on("deletePublicTrip", (evt, request) => {
            this.deleteTrip(request.trip, request.index);
        });

    }

    //#endregion

    //#region CRUD
    showPublicTripModal() {
        this.resetPublicTripModal();
        $('#public-trip-modal').modal('show');
    }

    closePublicTripModal() {
        $('#public-trip-modal').modal('hide');
    }

    addPublicTrip() {

        if (this.publicTripForm.$valid) {

            if (this.context.publicTripItem.inEdit) {

                //Transport invoice

                if (this.context.publicTripItem.haveInvoice) {

                    if (!this.context.publicTripItem.invoice.uniqueID)
                        this.context.publicTripItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();

                    this.$scope.$emit("editInvoiceInArray", this.context.publicTripItem.invoice, "Transporte Público");
                } else {
                    if (this.context.publicTripItem.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.publicTripItem.invoice);
                }

                if (this.context.publicTripItem.haveLodgement) {

                    if (!this.context.publicTripItem.lodgement.invoice.uniqueID)
                        this.context.publicTripItem.lodgement.invoice.uniqueID = this.expenseRepository.generateUniqueID();

                    this.$scope.$emit("editInvoiceInArray", this.context.publicTripItem.lodgement.invoice);
                }
                else {
                    if (this.context.publicTripItem.lodgement.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.publicTripItem.lodgement.invoice);
                }

                this.expenseRepository.expenseRequest.publicTrips =
                    this.expenseRepository.expenseRequest.publicTrips.map(_abs => {

                        if (_abs.inEdit) {
                            delete this.context.publicTripItem.inEdit;
                            delete this.context.publicTripItem.index;
                            return this.context.publicTripItem;
                        }
                        else
                            return _abs;
                    });
            }
            else {

                //Unique Identifier for invoice [use on document section]
                //
                if (this.context.publicTripItem.haveInvoice) {
                    this.context.publicTripItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();
                    this.$scope.$emit("addInvoiceToArray", this.context.publicTripItem.invoice, "Transporte Público");
                } else {
                    if (this.context.publicTripItem.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.publicTripItem.invoice);
                }

                if (this.context.publicTripItem.haveLodgement) {
                    this.context.publicTripItem.lodgement.invoice.uniqueID = this.expenseRepository.generateUniqueID();
                    this.$scope.$emit("addInvoiceToArray", this.context.publicTripItem.lodgement.invoice, "Hospedaje");
                } else {
                    if (this.context.publicTripItem.lodgement.invoice.uniqueID)
                        this.$scope.$emit("deleteInvoiceInArray", this.context.publicTripItem.lodgement.invoice);
                }
                this.expenseRepository.expenseRequest.publicTrips =
                    this.expenseRepository.expenseRequest.publicTrips.concat(this.context.publicTripItem);
            }
            this.$scope.$emit("calculateExpense", {});

            this.closePublicTripModal();

        } else {
            this.setFormInputDirty(this.publicTripForm);
            this.context.firstClick = true;
        }

    }

    editTrip(_trip, index) {
        //Set the object in the array on edit
        _trip.inEdit = true;

        this.context.publicTripItem = angular.copy(_trip);
        this.context.publicTripItem.index = index;
        $('#public-trip-modal').modal('show');
    }

    resetPublicTripModal() {
        this.context.publicTripItem = {
            vehicleType: "",

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
                supplier: "",
                uniqueID: ""
            },
            //
            traveledDistance: "",
            tripCost: "",
            tripCostPerKm: "",
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
        this.publicTripForm.$setUntouched();
        this.publicTripForm.$setPristine();
        this.context.firstClick = false;
    }

    deleteTrip(_trip, index) {

        this.notificationService.showConfirmationSwal(
            '¿Está seguro de querer eliminar este viaje público?',
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
                        this.expenseRepository.expenseRequest.publicTrips.splice(index, 1);

                    //get throw array and find at least one that does not have logical deleted
                    this.context.allTripsHaveLogicalDeleted = this.expenseRepository.expenseRequest.publicTrips.find(_abs => {
                        return !_abs.deleted;
                    }) ? true : false;

                    //
                    this.$scope.$emit("calculateExpense", {});

                    //Transport
                    //Update Invoices available
                    if (_trip.haveInvoice)
                        this.$scope.$emit("deleteInvoiceInArray", _trip.invoice);


                    this.$scope.$emit("deleteInvoiceInArray", _trip.invoice);
                    //Lodgement
                    if (_trip.haveLodgement)
                        this.$scope.$emit("deleteInvoiceInArray", _trip.lodgement.invoice);


                    this.messageService.getMessageAndShowToastr("Success - Eliminar Viaje Publico");

                    //Diggest have to be applied because SweetAlert is not in the angular context
                    this.$scope.$apply();

                }
            });


    }

    datesValidator() {
        this.$scope.$emit("validaTripDate", this.context.publicTripItem);
    }

    //#endregion

    //#region LOGIC

    calculatedNewCostAndDistance(model) {
        this.$scope.$emit("calculatedTripCostAndDistance", this.context.publicTripItem, model);
    }

    calculateLodgementCost() {
        let lodgementCost = parseFloat(this.context.publicTripItem.lodgement.lodgementCost) || 0;
        let lodgementDaysQuantity = parseFloat(this.context.publicTripItem.lodgement.lodgementDaysQuantity) || 0;
        this.context.publicTripItem.lodgement.lodgementTotalCost = lodgementCost * lodgementDaysQuantity || "";
    }

    cleanLodgementInfo() {

        this.context.firstClick = false;
        this.context.publicTripItem.lodgement = {
            invoice: {
                uniqueID: this.context.publicTripItem.lodgement.invoice.uniqueID
            }
        };
        this.publicTripForm.$setUntouched();
        this.publicTripForm.$setPristine();
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

    //NCF Validation

    validateNCF() {

        //This prevent re-search
        if (this.context.publicTripItem.invoice.rnc && this.context.publicTripItem.invoice.ncf) {

            if (this.context.publicTripItem.lodgement.invoice.rnc === this.context.publicTripItem.invoice.rnc && this.context.publicTripItem.lodgement.invoice.ncf === this.context.publicTripItem.invoice.ncf) {
                this.context.invalidLodgementNCF = true;
                this.context.publicTripItem.lodgement.invoice.supplier = "";

                this.messageService.getMessageAndShowToastr("Error - RNC y NCF Repetidos");
            } else {

                this.context.lastNCFSearch = { rnc: this.context.publicTripItem.invoice.rnc.trim(), ncf: this.context.publicTripItem.invoice.ncf.trim() };

                this.cardnetRepository.validateNCF(this.context.lastNCFSearch).then(response => {
                    if (response.data.isValid) {
                        if (response.data.existInList) {

                            //We search if the ncf and rnc combination is alredy in use, if not, we use it.
                            let search = this.expenseRepository.validateNCFIsNotInUse(this.context.lastNCFSearch.rnc, this.context.lastNCFSearch.ncf);

                            if (search.isRepeated) {
                                this.context.publicTripItem.invoice.supplier = "";
                                this.context.invalidNCF = true;
                                this.notificationService.showToast(`Esta combinación de RNC y NCF ha sido utilizada en el segmento de: ${search.location}.`, true, "error");


                            } else {
                                this.context.invalidNCF = false;
                                this.context.publicTripItem.invoice.supplier = response.data.razonSocial;
                            }

                        } else {

                            this.context.publicTripItem.invoice.supplier = "";
                            this.context.invalidNCF = true;
                            this.messageService.getMessageAndShowToastr("Error - NCF o RNC Repetido En Lista");

                        }
                    } else {
                        this.context.publicTripItem.invoice.supplier = "";
                        this.context.invalidNCF = true;
                        this.messageService.getMessageAndShowToastr("Error - NCF o RNC");

                    }
                }, error => {
                    console.error(error);
                    this.context.invalidNCF = false;
                    this.context.publicTripItem.invoice.supplier = "";

                    this.messageService.getMessageAndShowToastr("Error - Desconocido", true, error);

                });
            }
        }
    }

    cleanInvoiceInfo() {

        this.context.firstClick = false;
        this.context.publicTripItem.invoice = {
            uniqueID: this.context.publicTripItem.invoice.uniqueID || ""
        };
        this.context.publicTripItem.tripCost = 0;

        this.publicTripForm.$setUntouched();
        this.publicTripForm.$setPristine();
    }

    validateNCFLodgement() {

        //This prevent re-search
        if (this.context.publicTripItem.lodgement.invoice.rnc && this.context.publicTripItem.lodgement.invoice.ncf
            && (this.context.lastNCFSearch.rnc !== this.context.publicTripItem.lodgement.invoice.rnc
                || this.context.lastNCFSearch.ncf !== this.context.publicTripItem.lodgement.invoice.ncf)) {

            if (this.context.publicTripItem.lodgement.invoice.rnc === this.context.publicTripItem.invoice.rnc && this.context.publicTripItem.lodgement.invoice.ncf === this.context.publicTripItem.invoice.ncf) {
                this.context.invalidLodgementNCF = true;
                this.messageService.getMessageAndShowToastr("Error - RNC y NCF Repetidos");

            } else {

                this.context.lastNCFSearch = { rnc: this.context.publicTripItem.lodgement.invoice.rnc.trim(), ncf: this.context.publicTripItem.lodgement.invoice.ncf.trim() };

                this.cardnetRepository.validateNCF(this.context.lastNCFSearch).then(response => {
                    if (response.data.isValid) {
                        if (response.data.existInList) {

                            //We search if the ncf and rnc combination is alredy in use, if not, we use it.
                            let search = this.expenseRepository.validateNCFIsNotInUse(this.context.lastNCFSearch.rnc, this.context.lastNCFSearch.ncf);

                            if (search.isRepeated) {
                                this.context.publicTripItem.lodgement.invoice.supplier = "";
                                this.context.invalidLodgementNCF = true;
                                this.messageService.getMessageAndShowToastr(`Esta combinación de RNC y NCF ha sido utilizada en el segmento de: ${search.location}.`, true, "error");

                            } else {
                                this.context.invalidLodgementNCF = false;
                                this.context.publicTripItem.lodgement.invoice.supplier = response.data.razonSocial;
                            }

                        } else {

                            this.context.publicTripItem.lodgement.invoice.supplier = "";
                            this.context.invalidLodgementNCF = true;
                            this.messageService.getMessageAndShowToastr("Error - NCF o RNC Repetido En Lista");

                        }
                    } else {
                        this.context.publicTripItem.lodgement.invoice.supplier = "";
                        this.context.invalidLodgementNCF = true;
                        this.messageService.getMessageAndShowToastr("Error - NCF o RNC");

                    }
                }, error => {
                    console.error(error);
                    this.context.invalidLodgementNCF = false;
                    this.context.publicTripItem.lodgement.invoice.supplier = "";

                    this.messageService.getMessageAndShowToastr("Error - Desconocido", true, error);

                });
            }
        }
    }

}
export default publicTripModalController; 