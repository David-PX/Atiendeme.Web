import logo from '../../../../../images/logo.png';
import '../../../../../Content/Vendor/css/_custom.scss';
import coffeeBlackSVG from '../../../../../Images/coffee-black.svg';
import Stepper from 'bs-stepper';

/* @ngInject */
class mainController {
    constructor($scope, usuarioRepository, cardnetRepository, parametersService,
        $timeout, config, expenseRepository, messageService, notificationService, $window) {
        //Angular Injections
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$window = $window;
        //Repositories
        this.usuarioRepository = usuarioRepository;
        this.cardnetRepository = cardnetRepository;
        this.expenseRepository = expenseRepository;
        //Services and Commons
        this.parametersService = parametersService;
        this.config = config;
        this.messageService = messageService;
        this.notificationService = notificationService;
        //Img
        this.coffeeBlackSVG = coffeeBlackSVG;

        //
        this.stepper = Stepper;

        //Component Context
        this.context = {
            //misc
            logo: logo,

            //
            currentUser: {},
            currentDayAsYear: moment().format("YYYY"),
            //
            componentUrl: _spPageContextInfo.siteAbsoluteUrl,
            //

            Comment: "",
            requestID: 0,

            //Adm
            userDecisition: "",
            isEditable: false,
            canApprove: false,
            commentError: false,

            haveExpenseGroupClaims: false,
            haveClaims: true,

            haveValidEIKONUser: false,
            //
            showAllTheRequest: false,
            tripTypes: [],
            currencies: ["DOP", "USD"]
        };
    }

    //#region setup
    $onInit() {
        this.initialize();

        this.stepper = new Stepper(document.querySelector('#stepper1'), {
            linear: false,
            animation: true
        });
    }

    initialize() {
        this.businessMomentConfiguration();
        this.getCurrentUserInfo(true);
        this.getDropdowns();
        this.setUpBroadcasters();

        this.context.requestID = this.parametersService.getParameterByName("itemID") || 0;

        //Get current Request and populate the component
        if (this.context.requestID)
            this.getCompletedRequest();
        else {
            //this.getUserInfoFromEIKON();
            //Get gasoline
            this.getGasolineCost();

            this.context.isEditable = true;
        }
    }

    setUpBroadcasters() {
        //
        this.$scope.$on("calculateExpense", (evt) => {
            this.calculateRequestExpense();
        });

        //Invoices Array
        this.$scope.$on("addInvoiceToArray", (evt, invoice, category) => {
            this.addInvoiceToArray(invoice, category);
        });

        this.$scope.$on("editInvoiceInArray", (evt, invoice, category) => {
            this.editInvoiceInArray(invoice, category);
        });

        this.$scope.$on("deleteInvoiceInArray", (evt, invoice) => {
            this.deleteInvoiceInArray(invoice);
        });
    }
    //#endregion

    //#region GETS

    getDropdowns() {
        this.expenseRepository.retrievePropertiesList("SolicitudesReportesGastos", ["tripType"]).then(response => {
            this.context.tripTypes = response.data.value[0].Choices;
        }, error => {
            console.error(error);
            this.messageService.getMessageAndShowToastr("Error - Get Dropdowns", true, error); //
        });
    }

    getUserInfoFromEIKON() {
        if (this.expenseRepository.expenseRequest.request.userCode) {
            if (!this.cardnetRepository.endPointBackEnd) {
                this.$timeout(() => { this.getUserInfoFromEIKON(); });
                return;
            }

            //_spPageContextInfo.userEmail
            this.cardnetRepository.getUserInfo(this.expenseRepository.expenseRequest.request.userCode).then(response => {
                this.expenseRepository.expenseRequest.request.userCode = response.data[0].codigo;
                this.expenseRepository.expenseRequest.request.Department = response.data[0].departamento;

                this.context.haveValidEIKONUser = true;

                return response;
            }, error => {
                this.messageService.getMessageAndShowToastr("Error - No UserCode", true, error); //
                this.expenseRepository.expenseRequest.request.userCode = "";
                this.context.haveValidEIKONUser = true;
                console.error(error);
            });
        } else {
            this.context.haveValidEIKONUser = true;
        }
    }

    getGasolineCost() {
        this.expenseRepository.getGasolineCost().then(response => { }, error => {
            this.messageService.getMessageAndShowToastr("Error - No Gasoline", true, "Gasoline value not found"); //
            this.context.isEditable = false;
        });
    }
    getCompletedRequest() {
        this.expenseRepository.getCompletedRequest(this.context.requestID).then(response => {
            //Validations here
            this.checkRequestStateAndClaims();

            //
            this.context.visualState = this.getVisualState(this.expenseRepository.expenseRequest.request.State);

            //
            this.$scope.$broadcast("setChecks", {});
        }, error => {
            this.messageService.getMessageAndShowToastr("Error - No Gasoline", true, error); //
        });
    }

    getCurrentUserInfo(withRefresh) {
        return this.usuarioRepository.getCurrentUser(withRefresh).then((response) => {
            this.context.currentUser = angular.copy(response);

            if (!this.context.requestID)
                this.expenseRepository.expenseRequest.request.Author = {
                    JobTitle: response.jobTitle,
                    Title: response.fullName,
                    Department: response.department,
                    UserPicture: response.userPicture
                };

            return response;
        }, (error) => {
            //
            throw error;
        });
    }

    //#endregion

    //#region POST

    saveRequest() {
        if (this.requestValidator()) {
            this.notificationService.showConfirmationSwal(
                '¿Está seguro de enviar esta solicitud?',
                `Su solicitud sera enviada a su supervisor: <b>${this.context.currentUser.manager.fullName}</b> para su revisión.`,
                'warning',
                false,
                "Cancelar",
                "Enviar")
                .then((result) => {
                    if (result) {
                        this.setRequestStartInfo();

                        this.expenseRepository.saveExpense(this.context.requestID).then(response => {
                            this.context.requestID = this.expenseRepository.expenseRequest.request.ID;

                            this.notificationService.showSimpleSwal(
                                'Su solicitud se ha guardado éxitosamente',
                                'Se le ha enviado un correo a su supervisor para la revisión de su solicitud. Será notificado cuando esta sea aprobada.',
                                'success',
                                false)
                                .then(result => {
                                    this.reloadWithQueryString();
                                });
                        }, error => {
                            this.parseErrorAndSendToLogger(error, 'Save Absence', "REST");
                        });
                    }
                });
        }
    }

    //#endregion
    //#region logic

    //Need to have at least one expense in all the categories and all the invoices added on a file
    requestValidator() {
        let isGood = true;
        if (this.mainForm.$valid) {
            if (this.expenseRepository.expenseRequest.privateVehicles.length) {
                //You cant have private trips without vehicles, and if you have one, you need to add at least one private trip
                isGood = this.expenseRepository.expenseRequest.privateVehicles.find(veh => { return !veh.deleted; }) ? true : false;
                isGood = this.expenseRepository.expenseRequest.privateTrips.find(trip => { return !trip.deleted; }) ? true : false;;

                if (!isGood) {
                    this.messageService.getMessageAndShowToastr("Error - No Viajes Privados");
                    return isGood;
                }
            }

            if (this.expenseRepository.expenseRequest.publicTrips.length)
                isGood = this.expenseRepository.expenseRequest.publicTrips.find(trip => { return !trip.deleted; }) ? true : false;

            if (this.expenseRepository.expenseRequest.otherExpenses.length)
                isGood = this.expenseRepository.expenseRequest.otherExpenses.find(otherExpense => { return !otherExpense.deleted; }) ? true : false;

            //Notify at this point if nno expense have been add
            if (!this.expenseRepository.expenseRequest.privateVehicles.length && !this.expenseRepository.expenseRequest.privateTrips.length
                && !this.expenseRepository.expenseRequest.publicTrips.length && !this.expenseRepository.expenseRequest.otherExpenses.length) {
                this.messageService.getMessageAndShowToastr("Error - No Reportes");
                return isGood = false;
            }

            //if (this.expenseRepository.expenseRequest.documents.length) {
            let invoiceCount = this.expenseRepository.expenseRequest.invoicesAvailables.filter(invoice => { return !invoice.deleted; }).length;

            if (invoiceCount === 0) {
                return isGood;
            } else {
                let countInvoicesInDocuments = 0;

                this.expenseRepository.expenseRequest.documents.forEach(document => {
                    if (document.invoices)
                        countInvoicesInDocuments += document.invoices.filter(invoice => { return !invoice.deleted; }).length;
                });

                if (countInvoicesInDocuments !== invoiceCount) {
                    this.messageService.getMessageAndShowToastr("Error - Count Facturas - Documentos");

                    isGood = false;
                }
            }
        } else {
            this.setFormInputDirty(this.mainForm);
            this.messageService.getMessageAndShowToastr("Error - Campos Solicitud Restantes");
            isGood = false;
        }

        return isGood;
    }

    setRequestStartInfo() {
        this.expenseRepository.expenseRequest.request.LastState =
            this.expenseRepository.expenseRequest.request.State === "Requiere Modificación" ? "Requiere Modificación" : "";

        if (this.usuarioRepository.context.currentUser.manager.id) {
            this.expenseRepository.expenseRequest.request.State = "Pendiente de Aprobacion del Supervisor";
            this.expenseRepository.expenseRequest.request.nextApproverId = this.usuarioRepository.context.currentUser.manager.id;
        } else {
            this.expenseRepository.expenseRequest.request.State = "Completada"
        }
    }

    getVisualState(state) {
        let value = "";
        let approverName = this.expenseRepository.expenseRequest.request.nextApprover ? this.expenseRepository.expenseRequest.request.nextApprover.Title : ""

        switch (state) {
            case "Pendiente de Aprobacion del Supervisor":
                value = `Enviada a Aprobación de: ${approverName}`;
                break;

            case "Pendiente de Aprobacion del Director o VP":
                value = `Enviada a Aprobación de: ${approverName}`;
                break;

            case "Completada":
                value = "Completada";
                break;

            case "Rechazada":
                value = "Rechazada";
                break;

            case "Requiere Modificación":
                value = "Enviada a Modificación";
                break;

            default:
                value = state;
                break;
        }
        return value;
    }

    //Example: if it was complete, that mean the last guy approve it.
    checkRequestStateAndClaims() {
        if (!this.context.currentUser.id) {
            this.$timeout(() => { this.checkRequestStateAndClaims(); });
            return;
        }

        if (this.expenseRepository.expenseRequest.request.State === "Pendiente de Aprobacion del Supervisor" && this.expenseRepository.expenseRequest.request.nextApproverId === _spPageContextInfo.userId) {
            this.context.canApprove = true;
            this.context.haveExpenseGroupClaims = true;
        }
        else {
            if (this.expenseRepository.expenseRequest.request.State === "Pendiente de Aprobacion del Director o VP" && this.expenseRepository.expenseRequest.request.nextApproverId === _spPageContextInfo.userId) {
                this.context.canApprove = true;
                this.context.haveExpenseGroupClaims = true;
            } else {
                if (this.expenseRepository.expenseRequest.request.State === "Requiere Modificación" && this.expenseRepository.expenseRequest.request.AuthorId === _spPageContextInfo.userId) {
                    this.context.isEditable = true;
                    this.context.haveExpenseGroupClaims = true;
                } else {
                    this.context.isEditable = false;
                    this.context.canApprove = false;

                    this.usuarioRepository.isCurrentUserMemberOf("Encargados de Reporte de Gastos").then((response) => {
                        if (response) {
                            this.context.haveExpenseGroupClaims = true;
                        } else {
                            if (this.expenseRepository.expenseRequest.request.AuthorId !== _spPageContextInfo.userId
                                && this.expenseRepository.expenseRequest.request.ManagerId === _spPageContextInfo.userId
                                && this.expenseRepository.expenseRequest.request.nextApproverId === _spPageContextInfo.userId) {
                                this.context.haveClaims = false;

                                this.notificationService.showSimpleSwal(
                                    'No Autorizado',
                                    `Usted no cuenta con los permisos requeridos para ver esta solicitud.`,
                                    'success', false
                                )
                                    .then(result => {
                                        window.location.href = this.config.siteEndPoint;
                                    });
                            }
                        }
                    });
                }
            }
        }
    }

    showApproveModal(state) {
        this.context.userDecisition = state;
        $('#approbation-modal').modal('show');
    }

    closeApproveModal() {
        $('#approbation-modal').modal('hide');
    }

    validateAndSetApprobation() {
        var allGood = true;

        if (this.context.userDecisition === "Requiere Modificación" || this.context.userDecisition === "Rechazada") {
            if (!this.context.Comment) {
                allGood = false;

                //
                this.messageService.getMessageAndShowToastr("Warning - Agregar Comentario");
                //

                this.context.commentError = true;
            } else {
                this.context.commentError = false;
                this.setNewState(this.context.userDecisition);
                return allGood;
            }
        } else {
            this.context.commentError = false;
            //Approve Actions
            switch (this.expenseRepository.expenseRequest.request.State) {
                case 'Pendiente de Aprobacion del Supervisor':
                    if (this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("director")
                        || this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("vp")
                        || this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("vicepresidente")) {
                        this.setNewState("Completada");
                    } else {
                        this.setNewState("Pendiente de Aprobacion del Director o VP");
                    }
                    break;

                case 'Pendiente de Aprobacion del Director o VP':
                    if (this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("director")
                        || this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("vp")
                        || this.usuarioRepository.context.currentUser.jobTitle.toLowerCase().includes("vicepresidente")) {
                        this.setNewState("Completada");
                    } else {
                        this.setNewState("Pendiente de Aprobacion del Director o VP", true);
                    }
                    break;
                //Any error
                default:
                    allGood = false;
                    this.messageService.getMessageAndShowToastr("Error - Desconocido", true, `State is not in approval and user try to send approbation, current state: ${this.expenseRepository.expenseRequest.request.State}`); //
                    break;
            }
        }
        return allGood;
    }

    setNewState(_state, withApprover) {
        this.context.canApprove = false;
        this.context.isEditable = false;

        this.context.newState = {
            ID: this.expenseRepository.expenseRequest.request.ID,
            State: _state,
            LastState: this.expenseRepository.expenseRequest.request.State,
            Comment: this.context.Comment
        };

        if (withApprover)
            this.context.newState.nextApproverId = this.usuarioRepository.context.currentUser.manager.id;
        else
            this.context.newState.nextApproverId = null;
    }

    //#endregion

    //#region POST
    saveApprove() {
        if (this.validateAndSetApprobation()) {
            this.expenseRepository.saveNewState(this.context.newState).then(response => {
                this.closeApproveModal();

                this.notificationService.showSimpleSwal('Solicitud Actualizada', 'Su decisión ha sido enviada al solicitante.', 'success', false)
                    .then((result) => {
                        this.reloadWithQueryString();
                    });
            }, error => {
                this.parseErrorAndSendToLogger(error, 'Save Approve', "REST");
            });
        }
    }

    //#endregion

    //#region tools
    //Move
    parseErrorAndSendToLogger(error, comment, errorType) {
        let _error = error.name === "TypeError" ? error.stack : error;
        this.notificationService.showSwalErrorAndSendLog(_error, comment, errorType);
    }

    relocate() {
        $(location).attr('href', _spPageContextInfo.siteAbsoluteUrl);
    }

    reloadWithQueryString() {
        let url = window.location.href;

        if (url.indexOf('itemID') < 0) {
            let separator = (url.indexOf("?") === -1) ? "?" : (location.search.indexOf("&") === -1) ? "" : "&";
            let newParam = separator + `itemID=${this.context.requestID}`;
            let newUrl = url.replace(newParam, "");
            newUrl += newParam;
            window.location.href = newUrl;
        } else {
            window.location.reload();
        }
    }

    businessMomentConfiguration() {
        //moment.locale('');
        moment.updateLocale('es-do', {
            holidays: [],
            holidayFormat: 'DD/MM/YYYY',
            workingWeekdays: [1, 2, 3, 4, 5]
        });
    }

    requestDateRangeModified(momentModified) {
        this.context.showAllTheRequest = this.expenseRepository.expenseRequest.request.expenseFromDate && this.expenseRepository.expenseRequest.request.expenseUntilDate && this.expenseRepository.expenseRequest.request.currency ? true : false;

        let havePrivateTrips = this.expenseRepository.expenseRequest.privateTrips.find(priv => {
            return !priv.deleted && (!priv.momentFromDate.isSameOrAfter(this.expenseRepository.expenseRequest.request.momentExpenseFromDate) || !priv.momentUntilDate.isSameOrBefore(this.expenseRepository.expenseRequest.request.momentExpenseUntilDate));
        }) ? true : false;

        if (this.context.showAllTheRequest && havePrivateTrips) {
            this.notificationService.showConfirmationSwal(
                'Rango de Fecha Modificado',
                'Su solicitud cuenta con información que entra en conflicto con las fechas ingresadas, si acepta los cambios esta será removidas.',
                'warning',
                false,
                "Cancelar",
                "Modificar")
                .then((result) => {
                    if (result) {
                        this.expenseRepository.expenseRequest.privateTrips = this.expenseRepository.expenseRequest.privateTrips.filter((priv) => {
                            //If the item is alredy deleted we pass it
                            if (priv.deleted) {
                                return true;
                            } else {
                                //If the item is not inside the range and have an ID we set it deleted
                                if ((!priv.momentFromDate.isSameOrAfter(this.expenseRepository.expenseRequest.request.momentExpenseFromDate) ||
                                    !priv.momentUntilDate.isSameOrBefore(this.expenseRepository.expenseRequest.request.momentExpenseUntilDate)) && (priv.ID || priv.Id)) {
                                    priv.deleted = true;
                                    return true;
                                } else {
                                    //If the item is inside the range we return it [with or without ID]
                                    return priv.momentFromDate.isSameOrAfter(this.expenseRepository.expenseRequest.request.momentExpenseFromDate) || priv.momentUntilDate.isSameOrBefore(this.expenseRepository.expenseRequest.request.momentExpenseUntilDate);
                                }
                            }
                        });

                        this.expenseRepository.expenseRequest.publicTrips = this.expenseRepository.expenseRequest.publicTrips.filter((publicT) => {
                            return !(!publicT.deleted && (!publicT.momentFromDate.isSameOrAfter(this.expenseRepository.expenseRequest.request.momentExpenseFromDate) || !publicT.momentUntilDate.isSameOrBefore(this.expenseRepository.expenseRequest.request.momentExpenseUntilDate)));
                        });
                    } else {
                        //Set the moment value again in the request
                        this.expenseRepository.expenseRequest.request[momentModified] = this.context[`old${momentModified}`].format("DD/MM/YYYY hh:mm a");
                    }
                });
        }

        //Get new days
        this.calculateDaysRange();
    }

    changeCurrencyValue() {
        if (this.expenseRepository.expenseRequest.request.currency === "DOP")
            this.expenseRepository.expenseRequest.request.gasolineCost = this.expenseRepository.expenseRequest.common.gasolineCostDOPPerKm;
        else
            this.expenseRepository.expenseRequest.request.gasolineCost = this.expenseRepository.expenseRequest.common.gasolineCostUSDPerKm;

        this.context.showAllTheRequest = this.expenseRepository.expenseRequest.request.expenseFromDate && this.expenseRepository.expenseRequest.request.expenseUntilDate && this.expenseRepository.expenseRequest.request.currency ? true : false;

        //This have to mult with the travel distance, because the currency change, the price of the gas too
        this.resetTripsCostPerKmValue();

        this.calculateRequestExpense();
    }
    oldExpenseDate(newValue, oldValue, expenseMoment) {
        this.context[`old${expenseMoment}`] = oldValue;
        this.requestDateRangeModified(expenseMoment);
    }
    //#endregion

    //#region Calculated Expense

    resetTripsCostPerKmValue() {
        this.expenseRepository.expenseRequest.privateTrips.forEach(privT => {
            if (!privT.deleted) {
                privT.tripCostPerKm = this.expenseRepository.expenseRequest.request.gasolineCost * privT.traveledDistance;
            }
        });

        this.expenseRepository.expenseRequest.publicTrips.forEach(publicT => {
            if (!publicT.deleted) {
                publicT.tripCostPerKm = this.expenseRepository.expenseRequest.request.gasolineCost * publicT.traveledDistance;
            }
        });
    }

    calculateRequestExpense() {
        //Reset all the values
        this.expenseRepository.expenseRequest.request.totalCosts = {
            //Veh And Transport
            totalVehicleRentCost: 0,
            totalPublicTransport: 0,
            totalPrivateTransport: 0,

            //Lodgement
            totalLodgement: 0,

            //Totals
            advanceRecieved: 0,

            //Food
            totalBreakFast: 0,
            totalLunch: 0,
            totalSnack: 0,
            totalDinner: 0,
            totalOtherFoods: 0,
            //Attentions
            totalServices: 0,

            //Total Other viatics
            totalOtherViatics: 0,

            //Full Totals
            totalFood: 0,
            totalTransport: 0,
            totalOtherViaticsTotal: 0,

            totalCostPerKm: 0, //Just for private trips with vehicle with property 'Propio'

            totalRequest: this.expenseRepository.expenseRequest.request.totalCosts.totalRequest,
            differenceForLiquidation: this.expenseRepository.expenseRequest.request.totalCosts.differenceForLiquidation,

            //Full total of request
            total: 0
        };

        //Recalculate
        this.expenseRepository.expenseRequest.privateVehicles.forEach(privV => {
            if (privV.vehicleCost && privV.property === 'Rentado' && !privV.deleted)
                this.expenseRepository.expenseRequest.request.totalCosts.totalVehicleRentCost += privV.vehicleCost;
        });

        this.expenseRepository.expenseRequest.privateTrips.forEach(privT => {
            if (!privT.deleted) {
                if (privT.haveInvoice || privT.usedVehicle.property === "Taxi")
                    this.expenseRepository.expenseRequest.request.totalCosts.totalPrivateTransport += privT.tripCost;

                if (privT.haveLodgement)
                    this.expenseRepository.expenseRequest.request.totalCosts.totalLodgement += privT.lodgement.lodgementTotalCost;

                if (privT.usedVehicle.property === 'Propio')
                    this.expenseRepository.expenseRequest.request.totalCosts.totalCostPerKm += privT.tripCostPerKm;
            }
        });

        this.expenseRepository.expenseRequest.publicTrips.forEach(publicT => {
            if (!publicT.deleted) {
                if (publicT.haveInvoice)
                    this.expenseRepository.expenseRequest.request.totalCosts.totalPublicTransport += publicT.tripCost;

                if (publicT.haveLodgement)
                    this.expenseRepository.expenseRequest.request.totalCosts.totalLodgement += publicT.lodgement.lodgementTotalCost;
            }
        });

        this.expenseRepository.expenseRequest.otherExpenses.forEach(otherE => {
            if (otherE.concept === 'Servicios' && !otherE.deleted)
                //Rename this var
                this.expenseRepository.expenseRequest.request.totalCosts.totalServices = otherE.expenseCostTotal;
            else {
                if (otherE.concept === 'Alimento') {
                    switch (otherE.food) {
                        case 'Desayuno':
                            this.expenseRepository.expenseRequest.request.totalCosts.totalBreakFast = !otherE.deleted ? otherE.expenseCostTotal : 0;
                            break;

                        case 'Almuerzo':
                            this.expenseRepository.expenseRequest.request.totalCosts.totalLunch = !otherE.deleted ? otherE.expenseCostTotal : 0;
                            break;

                        case 'Merienda':
                            this.expenseRepository.expenseRequest.request.totalCosts.totalSnack = !otherE.deleted ? otherE.expenseCostTotal : 0;
                            break;

                        case 'Cena':
                            this.expenseRepository.expenseRequest.request.totalCosts.totalDinner = !otherE.deleted ? otherE.expenseCostTotal : 0;
                            break;

                        case 'Otro':
                            this.expenseRepository.expenseRequest.request.totalCosts.totalOtherFoods = !otherE.deleted ? otherE.expenseCostTotal : 0;
                            break;
                    }
                }
                else {
                    if (otherE.concept === 'Otro' && !otherE.deleted)
                        this.expenseRepository.expenseRequest.request.totalCosts.totalOtherViatics = otherE.expenseCostTotal;
                }
            }
        });

        //Full totals

        //Transport
        this.expenseRepository.expenseRequest.request.totalCosts.totalTransport = this.expenseRepository.expenseRequest.request.totalCosts.totalPrivateTransport +
            this.expenseRepository.expenseRequest.request.totalCosts.totalPublicTransport +
            this.expenseRepository.expenseRequest.request.totalCosts.totalVehicleRentCost + this.expenseRepository.expenseRequest.request.totalCosts.totalCostPerKm;

        //Food
        this.expenseRepository.expenseRequest.request.totalCosts.totalFood = this.expenseRepository.expenseRequest.request.totalCosts.totalBreakFast
            + this.expenseRepository.expenseRequest.request.totalCosts.totalLunch
            + this.expenseRepository.expenseRequest.request.totalCosts.totalSnack +
            this.expenseRepository.expenseRequest.request.totalCosts.totalDinner
            + this.expenseRepository.expenseRequest.request.totalCosts.totalOtherFoods;

        //Other viatics [lodgment, services, and others]
        this.expenseRepository.expenseRequest.request.totalCosts.totalOtherViaticsTotal = this.expenseRepository.expenseRequest.request.totalCosts.totalServices +
            this.expenseRepository.expenseRequest.request.totalCosts.totalOtherViatics +
            this.expenseRepository.expenseRequest.request.totalCosts.totalLodgement;

        //Full total of the complete request
        this.expenseRepository.expenseRequest.request.totalCosts.total = this.expenseRepository.expenseRequest.request.totalCosts.totalTransport +
            this.expenseRepository.expenseRequest.request.totalCosts.totalOtherViaticsTotal +
            this.expenseRepository.expenseRequest.request.totalCosts.totalFood;
    }

    calculateDaysRange() {
        if (this.expenseRepository.expenseRequest.request.momentExpenseFromDate && this.expenseRepository.expenseRequest.request.momentExpenseUntilDate) {
            //Normal diff
            this.expenseRepository.expenseRequest.request.calendarDaysQuantity = Math.ceil(this.expenseRepository.expenseRequest.request.momentExpenseUntilDate.diff(this.expenseRepository.expenseRequest.request.momentExpenseFromDate, "days", true)) || 0; //Prevent decimals
            //Business difference
            this.expenseRepository.expenseRequest.request.laborDaysQuantity = this.expenseRepository.expenseRequest.request.momentExpenseUntilDate.businessDiff(this.expenseRepository.expenseRequest.request.momentExpenseFromDate) || 0;
        }
    }

    //#endregion

    //#region Get all the NCF and RNC

    addInvoiceToArray(invoice, category) {
        let _invoice = angular.copy(invoice);

        _invoice.category = category;
        this.expenseRepository.expenseRequest.invoicesAvailables.push(_invoice);
    }

    editInvoiceInArray(invoice, category) {
        let founded = false;
        this.expenseRepository.expenseRequest.invoicesAvailables.forEach(_invoice => {
            if (_invoice.uniqueID === invoice.uniqueID) {
                founded = true;
                _invoice.supplier = invoice.supplier;
                _invoice.rnc = invoice.rnc;
                _invoice.ncf = invoice.ncf;
                _invoice.category = category;
            }
        });
        if (founded) {
            //search if any document have this invoice and edit it
            this.expenseRepository.expenseRequest.documents.forEach(_document => {
                if (_document.invoices)
                    _document.invoices.forEach(_invoice => {
                        if (_invoice.uniqueID === invoice.uniqueID) {
                            _invoice.supplier = invoice.supplier;
                            _invoice.rnc = invoice.rnc;
                            _invoice.ncf = invoice.ncf;
                        }
                    });
            });
        } else {
            this.addInvoiceToArray(invoice, category);
        }
    }

    deleteInvoiceInArray(invoice) {
        //TODO: CHECK THE DELETE
        if (!invoice.ID) {
            let index = this.expenseRepository.expenseRequest.invoicesAvailables.findIndex(_invoice => {
                return _invoice.uniqueID === invoice.uniqueID;
            });

            this.expenseRepository.expenseRequest.invoicesAvailables.splice(index, 1);

            //delete this invoice from documents
            this.expenseRepository.expenseRequest.documents.forEach(_document => {
                if (_document.invoices) {
                    let index = _document.invoices.findIndex(_invoice => {
                        return _invoice.uniqueID === invoice.uniqueID;
                    });
                    _document.realInvoicesAdded -= 1;
                    _document.invoices.splice(index, 1);
                }
            });
        } else {
            invoice.deleted = true;

            this.expenseRepository.expenseRequest.documents.forEach(_document => {
                if (_document.invoices) {
                    _document.invoices.forEach(_invoice => {
                        if (_invoice.uniqueID === invoice.uniqueID) {
                            _invoice.deleted = true;
                        }
                    });
                    _document.realInvoicesAdded -= 1;
                }
            });
        }
    }

    setFormInputDirty(form) {
        angular.forEach(form.$error,
            controls =>
                controls.forEach(control =>
                    control.$setDirty()
                ));
    }

    //#endregion

    //##region PDF FORCE
    confirmPrint() {
        if (confirm("¿Está seguro de generar el PDF? Esto romperá con el esquema del componente y ejecutará la impresión del browser")) {
            $('.dstepper-none').addClass('active dstepper-block').removeClass('dstepper-none');
            this.context.isEditable = false;
            this.context.canApprove = false;
            window.print();
        }
    }

    //#endregion

    //#region Excel Generator

    generateExcel() {
        let basicInfo = this.getBasicInfo();
        let transportInfo = this.getTransportInfo();
        let otherExpensesInfo = this.getOtherExpensesInfo();
        let invoicesAvailableInfo = this.getInvoicesAvailableInfo();
        let dgiiFormatInfo = this.getDGIIFormatInfo();

        jQuery.cachedScript = function (url, options) {
            // Allow user to set any option except for dataType, cache, and url
            options = $.extend(options || {}, {
                dataType: "script",
                cache: true,
                url: url
            });

            // Use $.ajax() since it is more flexible than $.getScript
            // Return the jqXHR object so we can chain callbacks
            return jQuery.ajax(options);
        };

        $.cachedScript(_spPageContextInfo.siteAbsoluteUrl + "/ReporteGastos/Scripts/src/js-xlsx/xlsx.core.min.js").done((data, textStatus, jqxhr) => {
            if (jqxhr.status === 200) {
                var cols = [
                    { wch: 20 },
                    { wch: 20 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 15 },
                    { wch: 20 },
                    { wch: 15 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 },
                    { wch: 30 }
                ];
                /* generate a worksheet */

                //Basic Info
                var wsBasicInfo = XLSX.utils.json_to_sheet(basicInfo, { skipHeader: true });
                wsBasicInfo["!cols"] = cols;
                //

                //Transport
                var wsTransport = XLSX.utils.json_to_sheet(transportInfo, { skipHeader: true });
                wsTransport["!cols"] = cols;
                //

                //Other Expenses
                var wsOtherExpenses = XLSX.utils.json_to_sheet(otherExpensesInfo, { skipHeader: true });
                wsOtherExpenses["!cols"] = cols;
                //

                //Invoices
                var wsInvoices = XLSX.utils.json_to_sheet(invoicesAvailableInfo, { skipHeader: true });
                wsInvoices["!cols"] = cols;
                //

                //Formato DGII
                var wsDGIIFormat = XLSX.utils.json_to_sheet(dgiiFormatInfo, { skipHeader: true });
                wsDGIIFormat["!cols"] = cols;
                //

                /* add to workbook */
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, wsBasicInfo, "Solicitud");
                XLSX.utils.book_append_sheet(wb, wsTransport, "Transporte");
                XLSX.utils.book_append_sheet(wb, wsOtherExpenses, "Otros Viaticos");
                XLSX.utils.book_append_sheet(wb, wsInvoices, "Comprobantes");
                XLSX.utils.book_append_sheet(wb, wsDGIIFormat, "Formato DGII");

                /* write workbook and force a download */
                XLSX.writeFile(wb, `Reporte_Gastos_${this.expenseRepository.expenseRequest.request.Author.Title}.xlsx`);
            }
            else {
                this.messageService.getMessageAndShowToastr("Error - Excel", true, 'Error generating excel'); //
            }
        });
    }

    getBasicInfo() {
        let data = [];

        data.push([`Solicitud de Gastos de: ${this.expenseRepository.expenseRequest.request.Author.Title}`]);
        data.push([`Código Empleado: ${this.expenseRepository.expenseRequest.request.Author.userCode}`]);
        data.push([`Moneda: ${this.expenseRepository.expenseRequest.request.currency}`]);
        data.push([`Tipo de Viaje: ${this.expenseRepository.expenseRequest.request.tripType}`]);
        data.push([`Fecha: ${this.expenseRepository.expenseRequest.request.expenseFromDate} - ${this.expenseRepository.expenseRequest.request.expenseUntilDate}`]);
        data.push([`Dias Laborales: ${this.expenseRepository.expenseRequest.request.laborDaysQuantity}`]);
        data.push([`Dias Calendario: ${this.expenseRepository.expenseRequest.request.calendarDaysQuantity}`]);
        data.push([`Costo Gasolina: ${this.expenseRepository.expenseRequest.request.gasolineCost}`]);
        data.push(["Excel Generado el: " + moment().format("DD/MM/YYYY hh:mm a")]);
        data.push([]);
        data.push([]);

        return data;
    }

    getTransportInfo() {
        let data = [];

        data.push([`Vehiculos Privados`]);
        data.push([]);
        data.push(["Codigo", "Propiedad", "Placa", "Tipo", "Compañia", "Factura", "Costo Renta", "Suplidor", "RNC", "NCF"]);
        let _index = 1;

        //Vehicle
        this.expenseRepository.expenseRequest.privateVehicles.forEach((veh) => {
            if (!veh.deleted) {
                let _data = [`#VP-${_index}`, veh.property, veh.vehiclePlate, veh.vehicleType, veh.company];

                if (veh.property === 'Rentado') {
                    _data.push('Si', veh.vehicleCost, veh.invoice.supplier, veh.invoice.rnc, veh.invoice.ncf);
                } else {
                    _data.push('No');
                }

                data.push(_data);

                _index++;
            }
        });

        //Transport
        //Title
        data.push([]);
        data.push([]);
        data.push([`Viajes Privados`]);
        data.push([]);

        data.push(["Codigo", "Vehiculo", "Origen", "Destino", "Distancia",
            "Costo", "Costo Por Km", "Fecha", "Factura", "Suplidor - T", "RNC - T", "NCF - T",
            "Hospedaje", "Nombre - H", "Tipo - H", "Cant. Dias - H", "Costo x Noche", "Costo Total - H",
            "Suplidor - H", "RNC - H", "NCF - H"]);
        _index = 1;
        this.expenseRepository.expenseRequest.privateTrips.forEach(trip => {
            if (!trip.deleted) {
                let usedVehicleID = this.expenseRepository.expenseRequest.privateVehicles.findIndex(veh => {
                    return veh.ID === trip.vehicleId;
                });
                //
                let _data = [`#PRT-${_index}`, `#VP-${usedVehicleID}`, trip.fromLocation.name, trip.untilLocation.name, trip.traveledDistance,
                trip.tripCost, trip.tripCostPerKm, `${trip.fromDate} - ${trip.untilDate}`];

                //
                if (trip.haveInvoice)
                    _data.push('Si', trip.invoice.supplier, trip.invoice.rnc, trip.invoice.ncf);
                else
                    _data.push("No");
                //

                if (trip.haveLodgement)
                    _data.push("Si", trip.lodgement.lodgementName, trip.lodgement.lodgementType, trip.lodgement.lodgementDaysQuantity,
                        trip.lodgement.lodgementCost, trip.lodgement.lodgementTotalCost,
                        trip.lodgement.invoice.supplier, trip.lodgement.invoice.rnc, trip.lodgement.invoice.ncf);
                else
                    _data.push("No");

                data.push(_data);
                _index++;
            }
        });

        //Public
        data.push([]);
        data.push([]);
        data.push([`Viajes Publicos`]);
        data.push([]);

        data.push(["Codigo", "Vehiculo", "Compañia", "Origen", "Destino", "Distancia",
            "Costo", "Fecha", "Factura", "Suplidor - T", "RNC - T", "NCF - T",
            "Hospedaje", "Nombre - H", "Tipo - H", "Cant. Dias - H", "Costo x Noche", "Costo Total - H",
            "Suplidor - H", "RNC - H", "NCF - H"]);
        _index = 1;
        this.expenseRepository.expenseRequest.publicTrips.forEach(trip => {
            if (!trip.deleted) {
                let _data = [`#PRT-${_index}`, trip.vehicleType, trip.company, trip.fromLocation.name, trip.untilLocation.name, trip.traveledDistance,
                trip.tripCost, `${trip.fromDate} - ${trip.untilDate}`];

                //
                if (trip.haveInvoice)
                    _data.push('Si', trip.invoice.supplier, trip.invoice.rnc, trip.invoice.ncf);
                else
                    _data.push("No");
                //

                //
                if (trip.haveLodgement) {
                    _data.push('Si', trip.lodgement.lodgementName,
                        trip.lodgement.lodgementType, trip.lodgement.lodgementDaysQuantity,
                        trip.lodgement.lodgementCost, trip.lodgement.lodgementTotalCost,
                        trip.lodgement.invoice.supplier, trip.lodgement.invoice.rnc, trip.lodgement.invoice.ncf);
                }
                else
                    _data.push("No");

                data.push(_data);

                _index++;
            }
        });

        return data;
    }

    getOtherExpensesInfo() {
        let data = [];
        let _index = 1;

        data.push([`Otros viaticos`]);
        data.push([]);

        data.push(["Codigo", "Concepto", "Otro Concepto", "Comida", "Otra Comida", "Monto",
            "ITBIS", "Propina", "Costo Total", "Fecha", "Suplidor", "RNC", "NCF"]);

        this.expenseRepository.expenseRequest.otherExpenses.forEach(exp => {
            if (!exp.deleted) {
                data.push([`#PRT-${_index}`, exp.concept, exp.otherConcept, exp.food, exp.otherFood, exp.amount,
                exp.itbis, exp.tip, exp.expenseCostTotal, exp.expenseDate, exp.invoice.supplier, exp.invoice.rnc, exp.invoice.ncf]);

                _index++;
            }
        });
        return data;
    }

    getInvoicesAvailableInfo() {
        let data = [];
        let _index = 1;

        data.push([`Documentos`]);
        data.push([]);

        data.push(["Indice", "Categoria", "Suplidor", "RNC", "NCF"]);

        this.expenseRepository.expenseRequest.invoicesAvailables.forEach(invoice => {
            data.push([_index, invoice.category, invoice.supplier, invoice.rnc, invoice.ncf]);
            _index++;
        });

        return data;
    }

    getDGIIFormatInfo() {
        let data = [];
        let _index = 1;

        data.push([`Formato DGII`]);
        data.push([]);

        data.push(["Indice", "RNC o Cédula", "Tipo Id", "Tipo Bienes y Servicios Comprados",
            "NCF ó Documento Modificado", "Fecha Comprobante", "Día Comprobante", "Total Monto Facturado", "ITBIS Retenido",
            "Monto Propina Legal"]);

        this.expenseRepository.expenseRequest.otherExpenses.forEach(otherEx => {
            if (otherEx.invoiceId) {
                data.push([_index, otherEx.invoice.rnc, '1', otherEx.concept, otherEx.invoice.ncf
                    , moment(otherEx.expenseDate).format("MM/YYYY"), moment(otherEx.expenseDate).format("DD"),
                    otherEx.amount, otherEx.itbis, otherEx.tip
                ]);
                _index++;
            }
        });

        this.expenseRepository.expenseRequest.privateVehicles.forEach(vehicle => {
            if (vehicle.invoiceId) {
                let vehicleInvoice = vehicle.invoice;

                data.push([_index, vehicleInvoice.rnc, '1', "Vehiculo Rentado", vehicleInvoice.ncf,
                    "",/*moment(vehicle.momentFromDate), */, "", vehicle.vehicleCost
                ]);
                _index++;
            }
        });

        this.expenseRepository.expenseRequest.privateTrips.forEach(privTrip => {
            if (privTrip.lodgement) {
                if (privTrip.lodgement.invoiceId) {
                    let lodgementInvoice = privTrip.lodgement.invoice;

                    data.push([_index, lodgementInvoice.rnc, '1', "Hospedaje", lodgementInvoice.ncf,
                        moment(privTrip.momentFromDate).format("MM/YYYY"), moment(privTrip.momentFromDate).format("DD"),
                        privTrip.lodgement.lodgementTotalCost
                    ]);
                    _index++;
                }
            }

            if (privTrip.invoiceId) {
                let invoice = privTrip.invoice;

                data.push([_index, invoice.rnc, '1', "Factura Viaje Privado", invoice.ncf,
                    moment(privTrip.momentFromDate).format("MM/YYYY"), moment(privTrip.momentFromDate).format("DD"),
                    privTrip.tripCost
                ]);
                _index++;
            }
        });

        this.expenseRepository.expenseRequest.publicTrips.forEach(publicTrip => {
            if (publicTrip.lodgement) {
                if (publicTrip.lodgement.invoiceId) {
                    let lodgementInvoice = publicTrip.lodgement.invoice;

                    data.push([_index, lodgementInvoice.rnc, '1', "Hospedaje", lodgementInvoice.ncf,
                        moment(publicTrip.momentFromDate).format("MM/YYYY"), moment(publicTrip.momentFromDate).format("DD"),
                        publicTrip.lodgement.lodgementTotalCost
                    ]);
                    _index++;
                }
            }

            if (publicTrip.invoiceId) {
                let invoice = publicTrip.invoice;

                data.push([_index, invoice.rnc, '1', "Factura Viaje Publico", invoice.ncf,
                    moment(publicTrip.momentFromDate).format("MM/YYYY"), moment(publicTrip.momentFromDate).format("DD"),
                    publicTrip.tripCost
                ]);
                _index++;
            }
        });

        return data;
    }
    //#endregion
}

export default mainController; 