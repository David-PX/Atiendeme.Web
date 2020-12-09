class expenseRepository {

    constructor($http, $q, $timeout, config, usuarioRepository, fileRepository, exceptionFactory) {
        this.$http = $http;
        this.$q = $q;
        this.$timeout = $timeout;
        this.config = config;
        this.usuarioRepository = usuarioRepository;
        this.fileRepository = fileRepository;
        this.exceptionFactory = exceptionFactory;
        this.baseURL = _spPageContextInfo.siteAbsoluteUrl;
        this.expenseRequest = {
            privateVehicles: [],
            privateTrips: [],
            publicTrips: [],
            workFlowLog: [],

            ///TEMPORARY
            temporaryLodgement: [],

            ///
            request: {
                userCode: "",
                department: "",
                gasolineCost: 0,
                currency: "",
                State: "",
                LastState: "",
                UserPicture: "",
                ManagerId: "",
                nextApproverId: "",
                tripType: "",
                expenseFromDate: "",
                momentExpenseFromDate: null,
                expenseUntilDate: "",
                momentExpenseUntilDate: null,
                details: "",
                laborDaysQuantity: 0,
                calendarDaysQuantity: 0,

                totalCosts: {

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
                    totalCostPerKm: 0,

                    totalRequest: 0,
                    differenceForLiquidation: 0,
                    total: 0
                }
            },
            //
            otherExpenses: [],
            documents: [], //Attachements
            //
            invoicesAvailables: [],
            common: {
                gasolineCostDOPPerKm: 0,
                gasolineUSD: 0
            }
        };
        this.IDsBuffer = [] //Buffer of uniquesIDs for front end purpose 
    }

    //#region GETS


    getGasolineCost() {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.Comunes + "')/items?$select=Title,value&$filter=Title eq 'gasolineCostDOPPerKm' or Title eq 'gasolineCostUSDPerKm'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    if (response.data.value.length) {


                        //Search DOP
                        let gasolineDOP = response.data.value.find(common => {
                            return common.Title === "gasolineCostDOPPerKm";
                        }) || {};

                        if (gasolineDOP.value)
                            this.expenseRequest.common.gasolineCostDOPPerKm = gasolineDOP.value;
                        else
                            throw response;

                        //Search USD
                        let gasolineUSD = response.data.value.find(common => {
                            return common.Title === "gasolineCostUSDPerKm";
                        }) || {}

                        if (gasolineUSD.value)
                            this.expenseRequest.common.gasolineCostUSDPerKm = gasolineUSD.value;
                        else
                            throw response;

                    }
                    else
                        throw response;
                    return response;
                } else {
                    throw response;
                }
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    //get all the dates from the event selected
    getCompletedRequest(itemID) {

        var promises = [];

        promises.push(this.getExpenseRequest(itemID));
        promises.push(this.getWorkFlowHistory(itemID));
        promises.push(this.getVehicles(itemID));
        promises.push(this.getTransport(itemID));
        promises.push(this.getOtherExpenses(itemID));
        promises.push(this.getLodgement(itemID));
        promises.push(this.getInvoices(itemID));
        promises.push(this.getFiles(itemID));

        return this.$q.all(promises).then((response) => {
            //check to return response with the array 
            this.setComplementaryElementsWithTheirElements();
            //PREPARE HERE THE INVOICES AND LOGEMENT
            return response;
        }, (error) => { console.error(error); throw error; });

    }

    getExpenseRequest(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SolicitudesReportesGastos + "')/items(" + itemID + ")?$select=*, Author/Title,Author/JobTitle,Author/Department,Author/ID, Manager/Department,Manager/Title, Manager/JobTitle, nextApprover/Department, nextApprover/Title, nextApprover/JobTitle &$expand=Author, Manager, nextApprover";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    this.getStripRequest(response.data);
                    return response;
                } else {
                    throw response;
                }
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getFiles(itemID) {

        return this.fileRepository.getFiles(itemID).then(response => {

            this.getStripFiles(response.data.value);
            return response;
        }, error => {
            throw error;
        });
    }
    getWorkFlowHistory(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGAprobaciones + "')/items?$filter=requestId eq '" + itemID + "'&$select=*,Author/Title, Author/ID, Created&$expand=Author/id&$orderby= Created desc";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                this.getStripWorkFlowHistory(response.data.value);
                return response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getVehicles(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGVehiculos + "')/items?$filter=requestId eq '" + itemID + "'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    this.getStripVehicles(response.data.value);
                    return response;
                } else
                    throw response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getTransport(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGTransporte + "')/items?$filter=requestId eq '" + itemID + "'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    this.getStripTrips(response.data.value);
                    return response;
                } else
                    throw response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getOtherExpenses(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGOtrosGastos + "')/items?$filter=requestId eq '" + itemID + "'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    this.getStripOtherExpenses(response.data.value)
                    return response;
                } else
                    throw response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getLodgement(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGHospedaje + "')/items?$filter=requestId eq '" + itemID + "'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    //check
                    this.getStripLodgement(response.data.value);
                    return response;
                } else
                    throw response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    getInvoices(itemID) {

        var _url = "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGFacturas + "')/items?$filter=requestId eq '" + itemID + "'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {
                    //check
                    this.getStripInvoice(response.data.value);
                    return response;
                } else
                    throw response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    setComplementaryElementsWithTheirElements() {

        //#region Private Vehicles

        //Invocies
        this.expenseRequest.privateVehicles.forEach(_vehicle => {

            if (_vehicle.property === 'Rentado') {
                let invoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === _vehicle.invoiceId; }) || {};

                if (invoice.ID) {
                    _vehicle.invoice = invoice;
                    _vehicle.indexIdentifier = invoice.uniqueID;
                }
            }
        });

        //#endregion

        //#region Private Trips

        this.expenseRequest.privateTrips.forEach(_trip => {

            //Invoices
            if (_trip.haveInvoice) {
                let invoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === _trip.invoiceId; }) || {};

                if (invoice.ID)
                    _trip.invoice = invoice;
            }

            //Lodgement
            if (_trip.haveLodgement) {
                let lodgement = this.expenseRequest.temporaryLodgement.find(_lodgement => { return _lodgement.transportId === _trip.ID; }) || {};

                let lodgementInvoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === lodgement.invoiceId; }) || {};

                if (lodgementInvoice.ID)
                    lodgement.invoice = lodgementInvoice;

                if (lodgement.ID)
                    _trip.lodgement = lodgement;

            }

            //Vehicle
            let vehicle = this.expenseRequest.privateVehicles.find(_vehicle => { return _vehicle.ID === _trip.vehicleId; }) || {};

            if (vehicle.ID)
                _trip.usedVehicle = vehicle;

        });

        //#endregion

        //#region Public Trips
        this.expenseRequest.publicTrips.forEach(_trip => {

            //Invoices
            if (_trip.haveInvoice) {
                let invoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === _trip.invoiceId; }) || {};

                if (invoice.ID)
                    _trip.invoice = invoice;
            }

            //Lodgement
            if (_trip.haveLodgement) {
                let lodgement = this.expenseRequest.temporaryLodgement.find(_lodgement => { return _lodgement.transportId === _trip.ID; }) || {};

                let lodgementInvoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === lodgement.invoiceId; }) || {};

                if (lodgementInvoice.ID)
                    lodgement.invoice = lodgementInvoice;

                if (lodgement.ID)
                    _trip.lodgement = lodgement;

            }
        });

        //#endregion

        //#region  Other Expenses
        this.expenseRequest.otherExpenses.forEach(_expense => {

            //Invoices

            let invoice = this.expenseRequest.invoicesAvailables.find(_invoice => { return _invoice.ID === _expense.invoiceId; }) || {};

            if (invoice.ID)
                _expense.invoice = invoice;

        });
        //#endregion

        //#region Documents

        this.expenseRequest.documents.forEach(document => {

            let invoices = this.expenseRequest.invoicesAvailables.filter(_invoice => {
                return document.invoicesId.includes(_invoice.ID);
            }) || [];

            if (invoices.length)
                document.invoices = invoices;

            if (invoices.length !== document.realInvoicesAdded) {

                this.exceptionFactory.logError(`Error with invoices: ${document.realInvoicesAdded} added, but document have ${invoices.length} invoices`, "", "REST WITH INVOICES ID");
                console.error(`Error with invoices: ${document.realInvoicesAdded} added, but document have ${invoices.length} invoices`);
            }
        });

        //#endregion


        //After this we can delete or empty the temporaryLodgement
        this.expenseRequest.temporaryLodgement = [];

    }



    //#region GET Stripped

    getStripRequest(request) {
        this.expenseRequest.request = {
            userCode: request.userCode,
            department: request.department,
            ID: request.ID,
            Author: request.Author,
            AuthorId: request.AuthorId,
            Created: moment(request.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
            CreatedAsNow: moment(request.Created, "YYYY-MM-DDTHH:mm:ssZ").fromNow(),
            //
            State: request.State,
            LastState: request.LastState,
            UserPicture: request.UserPicture,
            ManagerId: request.ManagerId,
            Manager: request.Manager,
            nextApproverId: request.nextApproverId,
            nextApprover: request.nextApprover,
            tripType: request.tripType,
            //Currency left
            currency: request.currency,
            //
            expenseFromDate: moment(request.expenseFromDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
            momentExpenseFromDate: moment(moment(request.expenseFromDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"), "DD/MM/YYYY HH:mm a"), //at same format
            //
            //
            expenseUntilDate: moment(request.expenseUntilDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
            momentExpenseUntilDate: moment(moment(request.expenseUntilDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"), "DD/MM/YYYY HH:mm a"), //at same format
            //
            gasolineCost: request.gasolineCost || 0,


            details: request.details,
            laborDaysQuantity: request.laborDaysQuantity,
            calendarDaysQuantity: request.calendarDaysQuantity,

            totalCosts: {
                totalVehicleRentCost: request.totalVehicleRentCost || 0,
                totalPublicTransport: request.totalPublicTransport || 0,
                totalPrivateTransport: request.totalPrivateTransport || 0,
                totalLodgement: request.totalLodgement || 0,
                advanceRecieved: request.advanceRecieved || 0,
                totalBreakFast: request.totalBreakFast || 0,
                totalLunch: request.totalLunch || 0,
                totalSnack: request.totalSnack || 0,
                totalDinner: request.totalDinner || 0,
                totalOtherFoods: request.totalOtherFoods || 0,
                totalServices: request.totalServices || 0,
                totalOtherViatics: request.totalOtherViatics || 0,
                totalFood: request.totalFood || 0,
                totalTransport: request.totalTransport || 0,
                totalOtherViaticsTotal: request.totalOtherViaticsTotal || 0,
                totalCostPerKm: request.totalCostPerKm || 0,
                totalRequest: request.totalRequest || 0,
                differenceForLiquidation: request.differenceForLiquidation || 0,
                total: request.total || 0
            }
        };
    }

    getStripWorkFlowHistory(logs) {

        logs.forEach(_log => {

            let __log = {
                ID: _log.ID,
                UserPicture: _log.UserPicture,
                Created: moment(_log.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                State: _log.State,
                LastState: _log.LastState,
                Comment: _log.Comment,
                requestId: _log.requestId,
                Author: _log.Author
            };


            switch (__log.State) {

                case 'Pendiente de Aprobacion del Supervisor':
                    __log.style = "--gray";
                    __log.visualState = __log.LastState === "Requiere Modificación" ? 'Editada' : 'Creada';
                    break;

                case 'Pendiente de Aprobacion del Director o VP':
                    __log.style = "--green";
                    __log.visualState = "Aprobada Supervisor";
                    break;

                case 'Completada':
                    __log.style = "--green";
                    __log.visualState = "Completada";
                    break;

                case 'Rechazada':
                    __log.style = "--red";
                    __log.visualState = "Solicitud Rechazada";

                    break;

                case 'Requiere Modificación':
                    __log.style = "--yellow";
                    __log.visualState = "Enviada a Modificación";
                    break;

                default:
                    __log.style = "--gray";
                    __log.visualState = __log.State;
                    break;
            }

            this.expenseRequest.workFlowLog.push(__log);
        });
    }


    getStripFiles(files) {

        files.forEach(file => {

            let __file = {
                requestId: file.requestId,
                ID: file.ID,
                fileName: file.File.Name,
                ServerRelativeUrl: file.File.ServerRelativeUrl,
                shortDescription: file.shortDescription,
                realInvoicesAdded: file.realInvoicesAdded,
                invoicesId: file.invoicesId
            };

            this.expenseRequest.documents.push(__file);
        });

    }
    getStripVehicles(vehicles) {

        vehicles.forEach(_vehicle => {

            let __vehicle = {

                ID: _vehicle.ID,
                Created: moment(_vehicle.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                requestId: _vehicle.requestId,
                //
                property: _vehicle.property,
                vehicleType: _vehicle.vehicleType,
                vehiclePlate: _vehicle.vehiclePlate,
                company: _vehicle.company,
                vehicleCost: _vehicle.vehicleCost || 0,
                //indexIdentifier here is the same as the invoice

            };

            if (__vehicle.property === "Rentado")
                __vehicle.invoiceId = _vehicle.invoiceId;

            this.expenseRequest.privateVehicles.push(__vehicle);
        });
    }

    getStripTrips(trips) {

        trips.forEach(_trip => {

            let __trip = {
                ID: _trip.ID,
                Created: moment(_trip.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),

                //
                requestId: _trip.requestId,
                //
                fromLocation: {
                    //
                    latitude: _trip.fromLocationLatitude,
                    ID: _trip.fromLocationID,
                    longitude: _trip.fromLocationLongitude,
                    name: _trip.fromLocationName
                },
                untilLocation: {
                    //
                    latitude: _trip.untilLocationLatitude,
                    ID: _trip.untilLocationID,
                    longitude: _trip.untilLocationLongitude,
                    name: _trip.untilLocationName
                    //g
                },

                //
                fromDate: moment(_trip.fromDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                momentFromDate: moment(moment(_trip.fromDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"), "DD/MM/YYYY HH:mm a"), //at same format
                // 
                untilDate: moment(_trip.untilDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                momentUntilDate: moment(moment(_trip.untilDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"), "DD/MM/YYYY HH:mm a"), //at same format
                //

                traveledDistance: _trip.traveledDistance,
                tripCost: _trip.tripCost || 0,  
                tripCostPerKm: _trip.tripCostPerKm || 0,
                //
                haveLodgement: _trip.haveLodgement || false,
                haveInvoice: _trip.haveInvoice || false,
                //
                Tipo: _trip.Tipo
            };

            if (__trip.haveInvoice) {
                __trip.invoiceId = _trip.invoiceId;
            }

            if (__trip.Tipo === "Privado") {
                __trip.vehicleId = _trip.vehicleId;

                this.expenseRequest.privateTrips.push(__trip);
            } else {
                __trip.vehicleType = _trip.vehicleType;
                __trip.company = _trip.company;
                this.expenseRequest.publicTrips.push(__trip);
            }
        });
    }

    getStripOtherExpenses(expenses) {

        expenses.forEach(_expense => {

            let __expense = {
                ID: _expense.ID,
                Created: moment(_expense.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                invoiceId: _expense.invoiceId,
                requestId: _expense.requestId,

                concept: _expense.concept,
                otherConcept: _expense.otherConcept,
                food: _expense.food,
                otherFood: _expense.otherFood,
                service: _expense.service,
                otherService: _expense.otherService,

                amount: _expense.amount || 0,
                itbis: _expense.itbis || 0,
                tip: _expense.tip || 0,
                expenseCostTotal: _expense.expenseCostTotal || 0,

                //
                expenseDate: moment(_expense.expenseDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                momentExpenseDate: moment(moment(_expense.expenseDate, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"), "DD/MM/YYYY HH:mm a"), //at same format
                //  

            };

            this.expenseRequest.otherExpenses.push(__expense);
        });
    }

    getStripLodgement(lodgements) {

        lodgements.forEach(lodgement => {
            let __lodgement = {
                ID: lodgement.ID,
                Created: moment(lodgement.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                invoiceId: lodgement.invoiceId,
                requestId: lodgement.requestId,
                transportId: lodgement.transportId,
                //
                transportType: lodgement.transportType,

                lodgementType: lodgement.lodgementType,
                lodgementName: lodgement.lodgementName,
                lodgementDaysQuantity: lodgement.lodgementDaysQuantity,
                lodgementTotalCost: lodgement.lodgementTotalCost,
                lodgementCost: lodgement.lodgementCost
            }

            this.expenseRequest.temporaryLodgement.push(__lodgement);
        });

    }

    getStripInvoice(invoices) {
        invoices.forEach(invoice => {
            let __invoice = {
                ID: invoice.ID || invoice.Id,
                Created: moment(invoice.Created, "YYYY-MM-DDTHH:mm:ssZ").format("DD/MM/YYYY HH:mm a"),
                requestId: invoice.requestId,
                inProgress: true, //
                category: invoice.category,
                rnc: invoice.rnc,
                ncf: invoice.ncf,
                supplier: invoice.supplier,
                uniqueID: this.generateUniqueID()
            };

            this.expenseRequest.invoicesAvailables.push(__invoice);
        });
    }

    retrievePropertiesList(listName, properties) {

        var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + listName + "')/fields?$filter=";

        for (var i = 0; i < properties.length; i++) {

            _url = _url + " EntityPropertyName eq '" + properties[i] + "'";

            if (i !== properties.length - 1)
                _url += " or";
        }

        //let _url = `${this.baseURL}/_api/web/lists/GetByTitle('${listName}')/fields?$filter=EntityPropertyName eq '${fieldName}'`;

        let req = this.requestConstructor(
            "GET",
            _url,
            false,
            null,
            null,
            "nometadata");


        return this.$http(req).then(
            (response) => {
                if (response.status < 205 && response.data.value.length)
                    return response;
                else
                    throw response;
            },
            (error) => {
                console.error(error);
                return error;
            }
        );
    }

    //#endregion

    //#endregion
    //#region POST

    saveExpense(itemID) {

        let _expenseRequest = this.stripExpenseRequest(this.expenseRequest.request);

        let _url = this.baseURL +
            "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SolicitudesReportesGastos + "')/items";

        if (itemID)
            _url += `(${itemID})`;

        let req = this.requestConstructor(
            "POST",
            _url,
            itemID ? true : false,
            "MERGE",
            _expenseRequest);


        return this.$http(req).then(
            response => {

                if (response.status < 205) {

                    let promises = [];

                    let expenseId = itemID || response.data.d.ID;

                    let workFlow = this.stripWorkflow({
                        State: _expenseRequest.State,
                        LastState: _expenseRequest.LastState,
                        UserPicture: this.usuarioRepository.context.currentUser.userPicture,
                        Comment: _expenseRequest.LastState === "Requiere Modificación" ? "Modificada" : "Creada",
                        request: expenseId
                    });

                    this.expenseRequest.request.ID = expenseId;

                    promises.push(this.saveWorkFlowLog(workFlow));

                    //We have to save first the invoices because all the other information is connected with it 
                    promises.push(this.saveInvoices(expenseId));


                    return this.$q.all(promises).then((_response) => {
                        return this.defaultQueueResolve(_response, { requestID: expenseId });
                    }, (error) => { throw error; });
                }
                else
                    throw response;
            }, (error) => {

                throw error;
            });

    }


    saveInvoices(expenseRequestId) {

        var promises = [];

        this.expenseRequest.invoicesAvailables.forEach(_invoice => {

            var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGFacturas + "')/items";

            let isEdit = false;

            if (_invoice.ID) {
                _url += "('" + _invoice.ID + "')";
                isEdit = true;
            }

            let req = this.requestConstructor("POST", _url, isEdit, _invoice.deleted ? "DELETE" : "MERGE", this.stripInvoice(_invoice, expenseRequestId));

            promises.push(this.$http(req).then(
                (response) => {
                    if (response.status < 205)
                        //Set the id of the invoice, this way when we iterate in the other list we can get their ID
                        _invoice.ID = _invoice.ID || _invoice.Id || response.data.d.ID;

                    return response;
                }, (error) => {
                    console.error(error);
                    throw error;
                }));

        });

        return this.$q.all(promises).then((response) => {
            return this.pushOtherItemsAfterInvoice(expenseRequestId);
        }, (error) => { console.error(error); throw error; });
    }

    pushOtherItemsAfterInvoice(expenseRequestId) {

        let promises = [];

        //Documents 
        //Search the IDs for the invoices
        this.expenseRequest.documents.forEach(document => {

            if (document.hasOwnProperty("invoices") && document.invoices.length) {
                document.invoicesIds = [];
                document.invoices.forEach(_invoice => {

                    let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
                        return invoice.uniqueID === _invoice.uniqueID;
                    }) || {};

                    if (invoice.ID && !document.invoicesIds.includes(invoice.ID))
                        document.invoicesIds.push(invoice.ID);
                });
            }
        });

        promises.push(this.fileRepository.saveFiles(this.expenseRequest.documents, expenseRequestId));

        promises.push(this.saveVehicle(expenseRequestId));
        promises.push(this.savePublicTransport(expenseRequestId));
        promises.push(this.saveOtherExpenses(expenseRequestId));

        return this.$q.all(promises).then((response) => {
            return this.defaultQueueResolve(response);
        }, (error) => { console.error(error); throw error; });
    }

    saveVehicle(expenseRequestId) {

        var promises = [];

        this.expenseRequest.privateVehicles.forEach(veh => {
            var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGVehiculos + "')/items";

            let isEdit = false;

            if (veh.ID) {
                _url += "('" + veh.ID + "')";
                isEdit = true;
            }

            let req = this.requestConstructor("POST", _url,
                isEdit, veh.deleted ? "DELETE" : "MERGE",
                this.stripVehicle(veh, expenseRequestId));

            promises.push(this.$http(req).then(
                (response) => {
                    //
                    if (response.status < 205)
                        veh.ID = veh.ID || veh.Id || response.data.d.ID;

                    return response;
                }, (error) => {
                    console.error(error);
                    throw error;
                }));

        });

        return this.$q.all(promises).then((response) => {
            return this.savePrivateTransport(expenseRequestId);
        }, (error) => { console.error(error); throw error; });
    }

    savePrivateTransport(expenseRequestId) {

        var promises = [];

        this.expenseRequest.privateTrips.forEach(trip => {

            var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGTransporte + "')/items";

            let isEdit = false;

            if (trip.ID) {
                _url += "('" + trip.ID + "')";
                isEdit = true;
            }

            let req = this.requestConstructor("POST", _url,
                isEdit, trip.deleted ? "DELETE" : "MERGE",
                this.stripPrivateTransport(trip, expenseRequestId));

            promises.push(this.$http(req).then(
                (response) => {

                    if (response.status < 205) {

                        trip.ID = trip.ID || trip.Id || response.data.d.ID;

                        if (trip.haveLodgement || (!trip.haveLodgement && trip.lodgement && trip.lodgement.ID))
                            return this.saveLodgement(trip.lodgement, expenseRequestId, "Privado", trip.ID, !trip.haveLodgement && trip.lodgement && trip.lodgement.ID);
                        else
                            return response;
                    }
                    else
                        throw response;
                }, (error) => {
                    console.error(error);
                    throw error;
                }));

        });

        return this.$q.all(promises).then((response) => {
            return this.defaultQueueResolve(response);
        }, (error) => { console.error(error); throw error; });
    }

    savePublicTransport(expenseRequestId) {

        var promises = [];

        this.expenseRequest.publicTrips.forEach(trip => {

            var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGTransporte + "')/items";

            let isEdit = false;

            if (trip.ID) {
                _url += "('" + trip.ID + "')";
                isEdit = true;
            }

            let req = this.requestConstructor("POST", _url,
                isEdit, trip.deleted ? "DELETE" : "MERGE",
                this.stripPublicTransport(trip, expenseRequestId));

            promises.push(this.$http(req).then(
                (response) => {
                    if (response.status < 205) {

                        trip.ID = trip.ID || trip.Id || response.data.d.ID;

                        //This prevent issue of lodgement being removed at modified
                        if (trip.haveLodgement || (!trip.haveLodgement && trip.lodgement && trip.lodgement.ID))
                            return this.saveLodgement(trip.lodgement, expenseRequestId, "Publico", trip.ID, (!trip.haveLodgement && trip.lodgement && trip.lodgement.ID));
                        else
                            return response;
                    }
                    else
                        throw response;
                }, (error) => {
                    console.error(error);
                    throw error;
                }));

        });

        return this.$q.all(promises).then((response) => {
            return this.defaultQueueResolve(response, response[0]);
        }, (error) => { console.error(error); throw error; });
    }

    saveLodgement(lodgement, expenseRequestId, transportType, transportId, isdeleted) {

        var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGHospedaje + "')/items";

        let isEdit = false;

        if (lodgement.ID) {
            _url += "('" + lodgement.ID + "')";
            isEdit = true;
        }

        let req = this.requestConstructor("POST", _url,
            isEdit, isdeleted ? "DELETE" : "MERGE",
            this.stripLodgement(lodgement, expenseRequestId, transportType, transportId));

        return this.$http(req).then(
            (response) => {
                return response;
            }, (error) => {
                console.error(error);
                throw error;
            });

    }

    saveOtherExpenses(expenseRequestId) {

        var promises = [];

        this.expenseRequest.otherExpenses.forEach(expense => {

            var _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGOtrosGastos + "')/items";

            let isEdit = false;

            if (expense.ID) {
                _url += "('" + expense.ID + "')";
                isEdit = true;
            }

            let req = this.requestConstructor("POST", _url,
                isEdit, expense.deleted ? "DELETE" : "MERGE",
                this.stripOtherExpenses(expense, expenseRequestId));

            promises.push(this.$http(req).then(
                (response) => {
                    return response;
                }, (error) => {
                    console.error(error);
                    throw error;
                }));

        });

        return this.$q.all(promises).then((response) => {
            return this.defaultQueueResolve(response, response[0]);
        }, (error) => { console.error(error); throw error; });
    }



    saveWorkFlowLog(log) {

        let _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGAprobaciones + "')/items";
        let req = this.requestConstructor("POST", _url, false, "POST", log);

        return this.$http(req)
            .then(response => {
                if (response.status < 205)
                    return response;
                else
                    throw response;
            }, error => {
                console.error(error);
                throw error;
            });
    }
    //
    saveNewState(newState) {

        let _state = this.stripExpenseNewState(newState);

        newState.request = newState.ID;

        let log = this.stripWorkflow(newState);

        let _url = this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SolicitudesReportesGastos + "')/items('" + newState.ID + "')";
        let req = this.requestConstructor("POST", _url, true, "MERGE", _state);

        return this.$http(req)
            .then(response => {
                if (response.status < 205)
                    return this.saveWorkFlowLog(log);
                else
                    throw response;
            }, error => {
                console.error(error);
                throw error;
            });
    }
    //#endregion
    //#region Strips
    stripExpenseRequest(expense) {
        var _expense = {
            State: expense.State,
            LastState: expense.LastState,
            ManagerId: expense.ManagerId || this.usuarioRepository.context.currentUser.manager.id,
            nextApproverId: expense.nextApproverId,
            UserPicture: expense.UserPicture || this.usuarioRepository.context.currentUser.userPicture,
            //
            totalVehicleRentCost: parseFloat(expense.totalCosts.totalVehicleRentCost) || 0,
            totalPublicTransport: parseFloat(expense.totalCosts.totalPublicTransport) || 0,
            totalPrivateTransport: parseFloat(expense.totalCosts.totalPrivateTransport) || 0,
            totalLodgement: parseFloat(expense.totalCosts.totalLodgement) || 0,
            advanceRecieved: parseFloat(expense.totalCosts.advanceRecieved) || 0,
            totalBreakFast: parseFloat(expense.totalCosts.totalBreakFast) || 0,
            totalLunch: parseFloat(expense.totalCosts.totalLunch) || 0,
            totalSnack: parseFloat(expense.totalCosts.totalSnack) || 0,
            totalDinner: parseFloat(expense.totalCosts.totalDinner) || 0,
            totalOtherFoods: parseFloat(expense.totalCosts.totalOtherFoods) || 0,
            totalServices: parseFloat(expense.totalCosts.totalServices) || 0,
            totalOtherViatics: parseFloat(expense.totalCosts.totalOtherViatics) || 0,
            totalFood: parseFloat(expense.totalCosts.totalFood) || 0,
            totalTransport: parseFloat(expense.totalCosts.totalTransport) || 0,
            totalOtherViaticsTotal: parseFloat(expense.totalCosts.totalOtherViaticsTotal) || 0,
            totalCostPerKm: parseFloat(expense.totalCosts.totalCostPerKm) || 0,
            total: parseFloat(expense.totalCosts.total) || 0,
            //totalRequest: parseFloat(expense.totalCosts.totalRequest) || 0,
            //differenceForLiquidation: parseFloat(expense.totalCosts.differenceForLiquidation) || 0,

            gasolineCost: expense.gasolineCost || 0,
            userCode: expense.userCode,
            department: expense.department,
            //
            currency: expense.currency,
            tripType: expense.tripType,

            expenseFromDate: moment(expense.expenseFromDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(expense.expenseFromDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            expenseUntilDate: moment(expense.expenseUntilDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(expense.expenseUntilDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            details: expense.details,
            laborDaysQuantity: parseFloat(expense.laborDaysQuantity) || 0,
            calendarDaysQuantity: parseFloat(expense.calendarDaysQuantity) || 0,

            //
            __metadata: this.config.listNames.expense.SolicitudesReportesGastosMetadata
        };
        return _expense;
    }

    stripExpenseNewState(newState) {

        return {
            State: newState.State,
            LastState: newState.LastState,
            nextApproverId: newState.nextApproverId,
            __metadata: this.config.listNames.expense.SolicitudesReportesGastosMetadata
        };
    }
    stripLodgement(lodgement, expenseRequestId, transportType, transportId) {

        let lodgementStripped = {
            lodgementType: lodgement.lodgementType,
            lodgementName: lodgement.lodgementName,
            lodgementDaysQuantity: lodgement.lodgementDaysQuantity,
            lodgementTotalCost: lodgement.lodgementTotalCost,
            lodgementCost: lodgement.lodgementCost,
            transportType: transportType,

            requestId: expenseRequestId,
            transportId: transportId,
            __metadata: this.config.listNames.expense.SRGHospedajeMetadata
        };

        let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
            return invoice.uniqueID === lodgement.invoice.uniqueID;
        }) || {};

        if (invoice.ID)
            lodgementStripped.invoiceId = invoice.ID;

        return lodgementStripped;
    }
    stripOtherExpenses(expense, expenseRequestId) {
        let otherExpense = {
            concept: expense.concept,
            otherConcept: expense.otherConcept,
            food: expense.food,
            otherFood: expense.otherFood,
            service: expense.service || "",
            otherService: expense.otherService || "",
            amount: parseFloat(expense.amount) || 0,
            itbis: parseFloat(expense.itbis) || 0,
            tip: parseFloat(expense.tip) || 0,
            expenseCostTotal: parseFloat(expense.expenseCostTotal) || 0,
            expenseDate: moment(expense.expenseDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(expense.expenseDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",

            requestId: expenseRequestId,
            //invoiceId: expense.invoiceId
            __metadata: this.config.listNames.expense.SRGOtrosGastosMetadata

        };

        let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
            return invoice.uniqueID === expense.invoice.uniqueID;
        }) || {};

        if (invoice.ID)
            otherExpense.invoiceId = invoice.ID;

        return otherExpense;
    }
    stripInvoice(invoice, expenseRequestId) {
        return {
            rnc: invoice.rnc || 0,
            ncf: invoice.ncf || 0,
            supplier: invoice.supplier,
            requestId: expenseRequestId,
            category: invoice.category,
            __metadata: this.config.listNames.expense.SRGFacturasMetadata
        };
    }
    stripPrivateTransport(transport, expenseRequestId) {

        let privateTransport = {

            Tipo: "Privado",
            //
            fromLocationLatitude: transport.fromLocation.latitude,
            fromLocationID: transport.fromLocation.ID,
            fromLocationLongitude: transport.fromLocation.longitude,
            fromLocationName: transport.fromLocation.name,

            //
            untilLocationLatitude: transport.untilLocation.latitude,
            untilLocationID: transport.untilLocation.ID,
            untilLocationLongitude: transport.untilLocation.longitude,
            untilLocationName: transport.untilLocation.name,
            //
            fromDate: moment(transport.fromDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(transport.fromDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            untilDate: moment(transport.untilDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(transport.untilDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            //
            tripCost: transport.tripCost || 0,
            tripCostPerKm: transport.tripCostPerKm || 0,
            traveledDistance: transport.traveledDistance,

            haveLodgement: transport.haveLodgement || false,
            haveInvoice: transport.haveInvoice || false,

            requestId: expenseRequestId,
            __metadata: this.config.listNames.expense.SRGTransporteMetadata
        };

        let vehicle = this.expenseRequest.privateVehicles.find(veh => {
            return veh.indexIdentifier === transport.usedVehicle.indexIdentifier;
        }) || {};

        if (vehicle.ID)
            privateTransport.vehicleId = vehicle.ID;

        if (privateTransport.haveInvoice) {

            let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
                return invoice.uniqueID === transport.invoice.uniqueID;
            }) || {};

            if (invoice.ID)
                privateTransport.invoiceId = invoice.ID;
        }
        //invoiceId: transport.invoiceId,
        //lodgementId: transport.lodgementId 

        return privateTransport;
    }

    stripPublicTransport(transport, expenseRequestId) {

        let publicTransportStrip = {
            Tipo: "Publico",
            //
            fromLocationLatitude: transport.fromLocation.latitude,
            fromLocationID: transport.fromLocation.ID,
            fromLocationLongitude: transport.fromLocation.longitude,
            fromLocationName: transport.fromLocation.name,

            //
            untilLocationLatitude: transport.untilLocation.latitude,
            untilLocationID: transport.untilLocation.ID,
            untilLocationLongitude: transport.untilLocation.longitude,
            untilLocationName: transport.untilLocation.name,
            //
            fromDate: moment(transport.fromDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(transport.fromDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            untilDate: moment(transport.untilDate, "DD/MM/YYYY HH:mm a").isValid() ? moment(transport.untilDate, "DD/MM/YYYY HH:mm a").format("YYYY-MM-DDTHH:mm:ssZ") : "1900-01-01",
            //
            tripCost: transport.tripCost || 0,
            //tripCostPerKm: transport.tripCostPerKm || 0,
            haveLodgement: transport.haveLodgement || false,
            haveInvoice: transport.haveInvoice || false,

            traveledDistance: transport.traveledDistance,
            vehicleType: transport.vehicleType,
             
            company: transport.company,

            requestId: expenseRequestId,
            __metadata: this.config.listNames.expense.SRGTransporteMetadata
        };

        //
        if (publicTransportStrip.haveInvoice) {

            let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
                return invoice.uniqueID === transport.invoice.uniqueID;
            }) || {};

            if (invoice.ID)
                publicTransportStrip.invoiceId = invoice.ID;
        }

        return publicTransportStrip;
    }

    stripVehicle(vehicle, expenseRequestId) {

        let vehicleStripped = {
            property: vehicle.property,
            vehicleType: vehicle.vehicleType,
            vehiclePlate: vehicle.vehiclePlate,
            company: vehicle.company,
            requestId: expenseRequestId,
            vehicleCost: parseFloat(vehicle.vehicleCost) || 0,

            __metadata: this.config.listNames.expense.SRGVehiculosMetadata

        };

        //Invoice set
        if (vehicle.property === 'Rentado') {

            let invoice = this.expenseRequest.invoicesAvailables.find(invoice => {
                return invoice.uniqueID === vehicle.invoice.uniqueID;
            }) || {};

            if (invoice.ID)
                vehicleStripped.invoiceId = invoice.ID;
        }

        return vehicleStripped;
    }

    stripWorkflow(log) {

        return {
            State: log.State,
            LastState: log.LastState,
            UserPicture: this.usuarioRepository.context.currentUser.userPicture,
            Comment: log.Comment,
            requestId: log.request,
            __metadata: this.config.listNames.expense.SRGAprobacionesMetadata
        };
    }

    //#endregion
    //#region UTIL

    requestConstructor(_method, _url, withPostHeaders, httpMethod, data, metadataType) {

        let req = {
            method: _method,
            url: _url,
            headers: this.getHeaders(withPostHeaders, httpMethod, metadataType),
        };
        if (data)
            req.data = data;

        return req;
    }

    getHeaders(withPostHeaders, httpMethod, metadataType) {

        metadataType = metadataType || "verbose";
        let _headers = {
            "accept": `application/json;odata=${metadataType}`,
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Content-Type": `application/json;odata=verbose`
        };

        if (withPostHeaders && httpMethod) {
            _headers["X-HTTP-Method"] = httpMethod;
            _headers["IF-MATCH"] = "*";
        }

        return _headers;
    }



    //#endregion

    //Tools MOVE FROM HERE
    //TODO: CHECK SECOND PARAMETER, IF IS EMPTY RETURN A PROMISE RESOLVED
    defaultQueueResolve(responses, objectToReturnOnSuccess) {

        let isGood = true;
        let errors = [];

        for (var i = 0; i < responses.length; i++) {
            if (responses[i] && responses[i].status > 205) {
                isGood = false;
                errors.push(responses[i]);
            }
        }

        if (isGood)
            return objectToReturnOnSuccess || responses[0];
        else
            throw {
                errors,
                status: 500 //use internal server error code
            };
    }


    //MOVE TO COMMON

    //#region NCF Validation

    //This method search in all the arrays and check if the combination is not alredy in use [exclude deleted ones]
    validateNCFIsNotInUse(rnc, ncf) {

        let isRepeated = false;
        let location = "";

        if (rnc && ncf) {

            //First we search in the rent cards
            isRepeated = this.expenseRequest.privateVehicles.find(veh => {
                return veh.invoice.rnc === rnc && veh.invoice.ncf === ncf && veh.property === 'Rentado' && !veh.deleted;
            }) ? true : false;

            if (isRepeated)
                return { isRepeated, location: "Vehiculos Rentados" };

            //Private trips
            isRepeated = this.expenseRequest.privateTrips.find(trip => {

                return trip.invoice.rnc === rnc && trip.invoice.ncf === ncf && !trip.deleted;
            }) ? true : false;

            if (isRepeated)
                return { isRepeated, location: "Transporte Privado" };

            //Public Trips
            isRepeated = this.expenseRequest.publicTrips.find(trip => { return trip.invoice.rnc === rnc && trip.invoice.ncf === ncf && !trip.deleted; }) ? true : false;

            if (isRepeated)
                return { isRepeated, location: "Transporte Publico" };

            //Other Expenses
            isRepeated = this.expenseRequest.otherExpenses.find(otherE => { return otherE.rnc === rnc && otherE.ncf === ncf && !otherE.deleted; }) ? true : false;

            if (isRepeated)
                return { isRepeated, location: "Otros Viaticos" };

        }

        return { isRepeated, location };
    }


    //This method search in the invoice table for a match
    checkInvoiceValidation(rnc, ncf) {

        var _url = `${this.baseURL}/_api/web/lists/GetByTitle('${this.config.listNames.expense.SRGFacturas}')/items?$select=Title&$filter=rnc eq '${rnc}' and ncf eq '${ncf}'`;

        var req = this.requestConstructor('GET', _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                if (response.status < 205) {

                    response.isValid = response.data.value.length ? false : true;
                    return response;
                } else {
                    throw response;
                }
            },
            (error) => {
                console.error(error);
                throw error;
            });

    }


    //#endregion

    //Generate at almost certified unique ID for front end identification purpose 
    generateUniqueID() {

        let uniqueID = Math.floor(Date.now() + Math.random());

        if (this.IDsBuffer.find(id => { return uniqueID === id; })) {
            this.$timeout(() => {
                this.generateUniqueID();
            }, 50);
        } else {
            this.IDsBuffer.push(uniqueID);
        }

        return uniqueID;
    }

}

export default expenseRepository;