class cardnetRepository {
    constructor($http, config, expenseRepository) {
        this.$http = $http;
        this.config = config;
        this.expenseRepository = expenseRepository;

        this.endPointBackEnd = "";
        this.baseURL = _spPageContextInfo.siteAbsoluteUrl;

        this.getEndPoint();
    }

    //Receive the email
    getUserInfo(identificacion) {
        let url = this.endPointBackEnd + `/api/utilitarios/usuario/${identificacion}`;
        let req = this.setRequest(url, 'GET');

        return this.$http(req)
            .then((response) => {
                if (response.status < 205 && response.data.length)
                    return response;
                else
                    throw response;
            }, (error) => { throw error; });
    }

    getEndPoint() {
        var _url = "/_api/web/lists/GetByTitle('Configuracion')/items?$filter=Title eq 'endPointUrl'";

        var req = this.requestConstructor('GET', this.baseURL + _url, false, "", {}, "nometadata");

        return this.$http(req).then(
            (response) => {
                this.endPointBackEnd = response.data.value[0].Valor;
                return response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    //This can be made with $q.
    //TODO: BIG Refactoring in all the controllers where this is called
    validateNCF(expense) {
        let url = this.endPointBackEnd + `/api/consultasdgii/ncfvalidation/${expense.rnc}/${expense.ncf}`;

        let req = this.setRequest(url, 'GET');
        return this.$http(req)
            .then(response => {
                //check also if data is not null
                if (response.status < 205 && response.data) {
                    //If is valid we check with the SP List
                    if (response.data.isValid) {
                        return this.expenseRepository.checkInvoiceValidation(expense.rnc, expense.ncf).then(checkResponse => {
                            let finalResult = {
                                data: {
                                    ...response.data,
                                    existInList: checkResponse.isValid
                                }
                            };

                            return finalResult;
                        }, error => {
                            throw error;
                        });
                    } else {
                        return response;
                    }
                } else
                    throw response;
            }, (error) => { throw error; });
    }

    setRequest(_url, _method) {
        return {
            url: _url,
            "async": true,
            method: _method,
            crossDomain: true,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        };
    }

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
}

export default cardnetRepository;