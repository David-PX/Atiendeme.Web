class fileRepository {

    constructor($http, $q, config) {
        this.$http = $http;
        this.$q = $q;
        this.config = config;

        this.baseURL = _spPageContextInfo.siteAbsoluteUrl;

    }

    saveFiles(_files, requestId) {

        let files = angular.copy(_files);
        let promises = [];
        let result = true;
        files.forEach((_file) => {

            if (_file.hasOwnProperty("deleted") && _file.deleted === true) {
                promises.push(this.deleteItem(this.config.listNames.expense.SRGDocumentos, _file.ID));
            }
            else {
                if (!_file.hasOwnProperty("ID")) {
                    let folderName = `${requestId} - Archivos`;
                    let fileProperties = {
                        requestId: requestId,
                        realInvoicesAdded: _file.realInvoicesAdded,
                        shortDescription: _file.shortDescription
                    };

                    if (_file.invoicesIds && _file.invoicesIds.length) {
                        fileProperties.invoicesId = this.lookupMultipleBuilder(_file.invoicesIds);
                    }
                    promises.push(this.checkIfFolderExists(this.config.listNames.expense.SRGDocumentos, folderName).then((folderExists) => {

                        if (folderExists.data.d.results.length === 0)
                            return this.createFolder(folderName).then(() => {
                                return this.saveFileToLibrary(folderName, _file, fileProperties, this.config.listNames.expense.SRGDocumentosMetadata);
                            });
                        else
                            return this.saveFileToLibrary(folderName, this.config.listNames.expense.SRGDocumentos, _file, fileProperties, this.config.listNames.expense.SRGDocumentosMetadata);
                    }, (error) => {

                        throw error;
                    }));
                }
            }
        });

        return this.$q.all(promises).then((response) => {

            return this.defaultQueueResolve(response, response[0]);
        });
    }

    checkIfFolderExists(folderName, listName) {
        let req = {
            method: 'GET',
            url: this.baseURL + "/_api/Web/GetFolderByServerRelativeUrl('" + listName + "')/Folders?$filter=Name eq '" + folderName + "'",
            headers: {
                "accept": "application/json;odata=verbose"
            }
        };

        return this.$http(req).then(
            (response) => {
                return response;
            }, (error) => {
                console.log(error);
                return error;
            });
    }

    createFolder(folderName) {
        let req = {
            method: 'POST',
            url: this.baseURL + "/_api/web/folders/add('" + this.config.listNames.expense.SRGDocumentosWithoutScore + "/" + folderName + "')",
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Content-Type": "application/json;odata=verbose"
            }
        };

        return this.$http(req).then(
            (response) => {
                return response;
            }, (error) => {
                console.error(error);
                return error;
            });
    }

    saveFileToLibrary(folderName, adjunto, fileProperties, fileMetadata) {
        let headers = {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "Content-Type": undefined
        };
        let url = this.baseURL + "/_api/web/getfolderbyserverrelativeurl('" + this.config.listNames.expense.SRGDocumentosWithoutScore + "/" + folderName + "')/files/add(overwrite=true, url='" + adjunto.fileName + "')";

        let req = {
            method: 'POST',
            url: url,
            headers: headers,
            data: adjunto.buffer,
            transformRequest: angular.identity
        };

        return this.$http(req).then(
            (response) => {
                if (response.status === 200) {
                    return this.updateFileProperties(response.data.d, fileProperties, fileMetadata);
                }
                return response;
            },
            (error) => {
                console.log(error);
                return error;
            }
        );
    }

    updateFileProperties(newFile, properties, metadata) {
        let headers = {
            "content-type": "application/json;odata=verbose",
            "accept": "application/json;odata=verbose",
            "X-HTTP-Method": "MERGE",
            "IF-MATCH": "*",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        };
        let url = this.baseURL + "/_api/web/GetFileByServerRelativePath(decodedurl='" + newFile.ServerRelativeUrl + "')/ListItemAllFields";

        let data = properties;
        data["__metadata"] = metadata;

        let req = {
            method: 'POST',
            url: url,
            headers: headers,
            data: data
        };

        return this.$http(req).then(
            (response) => {
                //push
                return response;
            },
            (error) => {
                console.error(error);
                return error;
            }
        );
    }

    getFiles(itemID) {
        let req = {
            method: 'GET',
            //ES NECESARIO EXPANDIR LA PROPIEDAD FILE PARA OBTENER LA INFORMACION DEL ADJUNTO
            url: this.baseURL + "/_api/web/lists/GetByTitle('" + this.config.listNames.expense.SRGDocumentos + "')/items?$select=*, File/Name, File/ServerRelativeUrl&$expand=File&$filter=requestId eq " + itemID,
            headers: {
                "accept": "application/json;odata=nometadata"
            }
        };

        return this.$http(req).then(
            (response) => {
                return response;
            }, (error) => {
                console.log(error);
                throw error;
            });
    }

    deleteItem(list, itemID) {
        let req = {
            method: 'POST',
            url: this.baseURL + "/_api/web/lists/GetByTitle('" + list + "')/items(" + itemID + ")",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*",
                "X-HTTP-Method": "DELETE"
            }
        };

        return this.$http(req).then(
            (response) => {
                return response;
            }, (error) => {
                console.error(error);
                throw error;
            });
    }


    lookupMultipleBuilder(columnIds) {

        let __metadata = { type: "Collection(Edm.Int32)" };

        if (columnIds.length)
            return { "results": columnIds, "__metadata": __metadata };
        else
            return { "results": [0], "__metadata": __metadata };
    }

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
}

export default fileRepository;