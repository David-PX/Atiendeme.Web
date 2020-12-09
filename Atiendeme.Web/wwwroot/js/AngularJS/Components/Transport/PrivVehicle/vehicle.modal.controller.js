/* @ngInject */
import 'jquery';

class vehicleModalController {

    constructor($scope, expenseRepository, cardnetRepository, messageService, notificationService, config) {

        this.$scope = $scope;
        this.expenseRepository = expenseRepository;
        this.cardnetRepository = cardnetRepository;
        this.config = config;
        //Common
        this.messageService = messageService;
        this.notificationService = notificationService;
        //

        this.context = {

            privateVehicleItem: {
                property: "",
                vehicleType: "",
                vehiclePlate: "",
                company: "",
                vehicleCost: 0,

                //
                invoice: {
                    rnc: "",
                    ncf: "",
                    supplier: "",
                    uniqueID: ""
                },
                //
                indexIdentifier: 0 //Generate - This is generated at creation and in each user get. [Just for front end purpose ]
            },

            //User first click on button
            firstClick: false,
            invalidNCF: false,
            lastNCFSearch: {}
        };

    }

    //#regionSetup
    $onInit() {
        this.setUpBroadcasters();
    }

    setUpBroadcasters() {
        //Call modal from parent
        this.$scope.$on("showPrivateVehicleModal", (evt, request) => {
            this.showPrivateVehicleModal();
        });

        this.$scope.$on("editPrivateVehicle", (evt, request) => {
            this.editVehicle(request.vehicle, request.index);
        });

        this.$scope.$on("deletePrivateVehicle", (evt, request) => {
            this.deleteVehicle(request.vehicle, request.index);
        });

    }

    //#endregion

    //#region CRUD
    showPrivateVehicleModal() {
        this.resetPrivateVehicleModal();
        $('#private-vehicle-modal').modal('show');
    }

    closePrivateVehicleModal() {

        $('#private-vehicle-modal').modal('hide');
    }

    addPrivateVehicle() {

        if (this.privateVehicleForm.$valid) {

            if (this.vehicleValidator()) {

                if (this.context.privateVehicleItem.inEdit) {

                    if (this.context.privateVehicleItem.property === 'Rentado') {

                        if (!this.context.privateVehicleItem.invoice.uniqueID)
                            this.context.privateVehicleItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();

                        this.$scope.$emit("editInvoiceInArray", this.context.privateVehicleItem.invoice, "Vehículo Rentado");
                    } else {
                        if (this.context.privateVehicleItem.invoice.uniqueID) {
                            this.$scope.$emit("deleteInvoiceInArray", this.context.privateVehicleItem.invoice);
                        }
                    }

                    this.expenseRepository.expenseRequest.privateVehicles =
                        this.expenseRepository.expenseRequest.privateVehicles.map(_abs => {

                            if (_abs.inEdit) {
                                delete this.context.privateVehicleItem.inEdit;
                                delete this.context.privateVehicleItem.index;
                                return this.context.privateVehicleItem;
                            }
                            else
                                return _abs;
                        });

                    //This refresh all the tripCost for Taxi if the user change the type in edition and the item have no invoice
                    this.expenseRepository.expenseRequest.privateTrips.forEach(privT => {

                        if (privT.usedVehicle.indexIdentifier === this.context.privateVehicleItem.indexIdentifier
                            && this.context.privateVehicleItem.property !== "Taxi"
                            && !privT.haveInvoice)
                            privT.tripCost = 0;
                    });
                }
                else {

                    //NOTE: We use this 'unique' identifier for the reference in the transport section, this way the binding is not loss 
                    this.context.privateVehicleItem.indexIdentifier = this.expenseRepository.generateUniqueID();

                    //Unique Identifier for invoice [use on document section]

                    if (this.context.privateVehicleItem.property === 'Rentado') {
                        this.context.privateVehicleItem.invoice.uniqueID = this.expenseRepository.generateUniqueID();
                        this.$scope.$emit("addInvoiceToArray", this.context.privateVehicleItem.invoice, "Vehículo Rentado");
                    } else {
                        if (this.context.privateVehicleItem.invoice.uniqueID) {
                            this.$scope.$emit("deleteInvoiceInArray", this.context.privateVehicleItem.invoice);
                        }
                    }


                    this.expenseRepository.expenseRequest.privateVehicles =
                        this.expenseRepository.expenseRequest.privateVehicles.concat(this.context.privateVehicleItem);

                }
                this.$scope.$emit("calculateExpense", {});

                this.closePrivateVehicleModal();
            }
        } else {
            this.setFormInputDirty(this.privateVehicleForm);
            this.context.firstClick = true;
        }

    }

    editVehicle(_vehicle, index) {
        //Set the object in the array on edit
        _vehicle.inEdit = true;

        this.context.privateVehicleItem = angular.copy(_vehicle);
        this.context.privateVehicleItem.index = index;
        this.context.privateVehicleItemOriginal = angular.copy(_vehicle);

        $('#private-vehicle-modal').modal('show');
    }

    resetPrivateVehicleModal() {
        this.context.privateVehicleItem =
            {
                property: "",
                vehicleType: "",
                vehiclePlate: "",
                company: "",
                vehicleCost: 0,
                //
                invoice: {
                    rnc: "",
                    ncf: "",
                    supplier: "",
                    uniqueID: ""
                }
                //
            };
        //set touched || Reset form
        this.privateVehicleForm.$setUntouched();
        this.privateVehicleForm.$setPristine();
        this.context.firstClick = false;
        this.context.lastNCFSearch = {};
    }

    deleteVehicle(_vehicle, index) {
        this.notificationService.showConfirmationSwal(
            '¿Está seguro de querer eliminar este vehículo?',
            "Al eliminar este vehículo tambien se borrarán todos los viajes asociados.",
            'warning',
            true,
            "Cancelar",
            "Eliminar")
            .then((result) => {

                if (result) {

                    this.expenseRepository.expenseRequest.privateTrips = this.expenseRepository.expenseRequest.privateTrips.filter(
                        privT => {

                            allGood = true;
                            if (privT.usedVehicle.vehiclePlate === _vehicle.vehiclePlate || privT.usedVehicle.ID === _vehicle.ID) {

                                if (privT.ID || privT.Id)
                                    privT.deleted = true;
                                else
                                    allGood = false;
                            }
                            return allGood;
                        }
                    );

                    if (_vehicle.ID || _vehicle.Id)
                        _vehicle.deleted = true;
                    else
                        this.expenseRepository.expenseRequest.privateVehicles.splice(index, 1);

                    //get throw array and find at least one that does not have logical deleted
                    this.allVehiclesHaveLogicalDeleted = this.expenseRepository.expenseRequest.privateVehicles.find(_veh => {
                        return !_veh.deleted;
                    }) ? true : false;


                    this.$scope.$emit("calculateExpense", {});

                    //
                    this.$scope.$emit("deleteInvoiceInArray", _vehicle.invoice);

                    this.messageService.getMessageAndShowToastr("Success- Eliminar Vehiculo");

                    //Diggest have to be applied because SweetAlert is not in the angular context
                    this.$scope.$apply();

                }
            });


    }

    vehicleValidator() {

        let isGood = true;

        //1. If vehicle is not a 'Taxi' we have to search for non-uniques plates.
        if (this.context.privateVehicleItem.property !== 'Taxi') {
            let vehiclePlateRepeated = this.expenseRepository.expenseRequest.privateVehicles.find(_veh => {

                return _veh.vehiclePlate === this.context.privateVehicleItem.vehiclePlate && !_veh.inEdit;
            }) ? true : false;

            if (vehiclePlateRepeated) {

                this.messageService.getMessageAndShowToastr("Error - Placa Repetida");
                return isGood = false;
            }
        }

        return isGood;
    }

    resetVariables() {

        this.context.privateVehicleItem.vehiclePlate = '';
        this.context.privateVehicleItem.company = '';
        this.context.privateVehicleItem.vehicleCost = '';
        this.context.privateVehicleItem.invoice = {
            uniqueID: this.context.privateVehicleItem.invoice.uniqueID || ""
        };
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
        if (this.context.privateVehicleItem.invoice.rnc && this.context.privateVehicleItem.invoice.ncf
            && (this.context.lastNCFSearch.rnc !== this.context.privateVehicleItem.invoice.rnc
                || this.context.lastNCFSearch.ncf !== this.context.privateVehicleItem.invoice.ncf)) {


            this.context.lastNCFSearch = { rnc: this.context.privateVehicleItem.invoice.rnc.trim(), ncf: this.context.privateVehicleItem.invoice.ncf.trim() };

            this.cardnetRepository.validateNCF(this.context.lastNCFSearch).then(response => {
                if (response.data.isValid) {
                    if (response.data.existInList) {

                        //We search if the ncf and rnc combination is alredy in use, if not, we use it.
                        let search = this.expenseRepository.validateNCFIsNotInUse(this.context.lastNCFSearch.rnc, this.context.lastNCFSearch.ncf);

                        if (search.isRepeated) {
                            this.context.privateVehicleItem.invoice.supplier = "";
                            this.context.invalidNCF = true;

                            this.notificationService.showToast(`Esta combinación de RNC y NCF ha sido utilizada en el segmento de: ${search.location}.`, "", "error");

                        } else {
                            this.context.invalidNCF = false;
                            this.context.privateVehicleItem.invoice.supplier = response.data.razonSocial;
                        }

                    } else {

                        this.context.privateVehicleItem.invoice.supplier = "";
                        this.context.invalidNCF = true;
                        this.messageService.getMessageAndShowToastr("Error - NCF o RNC Repetido En Lista");

                    }
                } else {

                    this.context.privateVehicleItem.invoice.supplier = "";
                    this.context.invalidNCF = true;
                    this.messageService.getMessageAndShowToastr("Error - NCF o RNC");

                }
            }, error => {
                console.error(error);
                this.context.invalidNCF = false;
                this.context.privateVehicleItem.invoice.supplier = "";

                this.messageService.getMessageAndShowToastr("Error - Desconocido", true, error);
            });
        }
    }


}


export default vehicleModalController; 