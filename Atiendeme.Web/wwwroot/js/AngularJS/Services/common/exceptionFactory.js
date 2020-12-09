class exceptionFactory {

    constructor($http, config) {
        this.$http = $http;
        this.config = config;
        this.baseURL = _spPageContextInfo.siteAbsoluteUrl;
    }

    logError(error, comment, errorType) {

        let _data = {
            Title: this.config.ComponentName,
            ErrorType: errorType,
            StackTrace: error,
            Comment: comment,
            __metadata: this.config.listNames.LogsMetadata
        };

        let req = this.buildRequest(_data);

        this.$http(req).then(
            (response) => {
                return response;
            },
            (error) => {
                console.error(error);
                throw error;
            });
    }

    buildRequest(_data) {

        return {
            method: 'POST',
            url: `${this.baseURL}/_api/web/lists/GetByTitle('${this.config.listNames.Logs}')/items`,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Content-Type": "application/json;odata=verbose",
                "X-HTTP-Method": "POST",
                "IF-MATCH": "*"
            },
            data: _data
        };
    }

}

export default exceptionFactory;