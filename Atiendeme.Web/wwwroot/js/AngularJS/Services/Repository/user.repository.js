//Nota: no se extraen los $http para facilitar las tareas de debug.
class usuarioRepository {

    constructor($http, $q, config) {
        this.$http = $http;
        this.config = config;

        this.baseUrl = _spPageContextInfo.siteAbsoluteUrl;
        this.prefix = "i:0#.f|membership|";
        this.$q = $q;

        this.context = {
            currentUser: {
                manager: {}
            }
        };
    }

    //#region
    getCurrentUserInfo() {

        var req = this.requestBuilder(this.baseUrl + "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?select=FirstName&LastName&Department");

        return this.$http(req).then(
            function (response) {

                if (response.status < 205)
                    return response;
                else
                    throw response;
            }, function (error) {

                return error;
            });
    }

    isCurrentUserMemberOf(groupName) {

        var req = this.requestBuilder(this.baseUrl + "/_api/web/sitegroups/getByName('" + groupName + "')/Users?$filter=Id eq " + _spPageContextInfo.userId);
        req.async = false;

        return this.$http(req).then(
            function (response) {
                //Check with no metadata 
                if (response.data.value[0] != null) {
                    return true;//User is a Member, do something or return true
                }
                return false;
            }, function (error) {
                return error;
            });
    }

    getUserInfoByAccountName(username) {
       
        username = encodeURIComponent(username);

        var req = this.requestBuilder(_spPageContextInfo.siteAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + username + "'");

        return this.$http(req).then(
            function (response) {
                if (response.status < 205 && response.data)
                    return response;
                else
                    throw response;
            }, function (error) {
                throw error;
            });
    }

    getUserID(accountName) {

        if (!accountName.startsWith(this.prefix)) {
            accountName = this.prefix + accountName;
        }

        var req = this.requestBuilder(this.baseUrl + "/_api/web/siteusers(@v)?@v='" + encodeURIComponent(accountName) + "'");

        return this.$http(req).then(
            function (response) {
                if (response.status < 205)
                    return response;
                else
                    throw response;

            }, function (error) {
                throw error;
            });
    }

    //#endregion
    //Methods
    getCurrentUser(withRefresh) {

        if (withRefresh) {
            var promises = [];

            promises.push(this.setCurrentUser());

            return this.$q.all(promises).then((response) => {
                return this.defaultQueueResolve(response, this.context.currentUser);
            },
                (error) => {
                    throw error;
                });
        } else {
            return this.context.currentUser;
        }
    }

    //#region Sets

    setCurrentUser() {
        return this.getCurrentUserInfo().then(
            (response) => {

                if (response.status < 205) {
                    var properties = response.data.UserProfileProperties;

                    this.context.currentUser.id = _spPageContextInfo.userId;
                    this.context.currentUser.fullName = _spPageContextInfo.userDisplayName;

                    this.context.currentUser.department = this.getProperty(properties, "Department");
                    this.context.currentUser.jobTitle = this.getProperty(properties, "Title");
                    //this.context.currentUser.memberSince = moment(this.getProperty(properties, "SPS-PersonalSiteFirstCreationTime"), "D/M/YYYY");
                    let email = this.getProperty(properties, 'WorkEmail');
                    this.context.currentUser.userPicture = `${this.config.siteEndPoint}/_layouts/15/userphoto.aspx?size=M&username=${email}`;

                    var manager = this.getProperty(properties, "Manager");
                    if (manager)
                        return this.setManagerInfo(manager);
                    else
                        return response;
                } else {
                    throw response;
                }
            },
            (error) => {
                throw error;
            });
    }

    setManagerInfo(accountName) {

        return this.getUserInfoByAccountName(accountName).then(
            (response) => {
                if (response.status < 205) {
                    var properties = response.data.UserProfileProperties;

                    this.context.currentUser.manager = {};

                    this.context.currentUser.manager.fullName = this.getProperty(properties, "PreferredName");

                    this.context.currentUser.manager.accountName = this.getProperty(properties, "AccountName");
                    this.context.currentUser.manager.email = this.getProperty(properties, "WorkEmail");
                    this.context.currentUser.manager.jobTitle = this.getProperty(properties, "Title");
                    this.context.currentUser.manager.departament = this.getProperty(properties, "Department");

                    let email = this.getProperty(properties, 'WorkEmail');
                    this.context.currentUser.manager.userPicture = `${this.config.siteEndPoint}/_layouts/15/userphoto.aspx?size=M&username=${email}`;

                    var promises = [];

                    promises.push(this.setManagerID(this.context.currentUser.manager.accountName));
                    //promises.push(getUsuarioAPI(userName, 'encargado'));

                    return this.$q.all(promises).then(response => {
                        return this.defaultQueueResolve(response, response[0]); //
                    }, (error) => {
                        throw error;
                    });
                } else {
                    throw response;
                }
            },
            (error) => {
                throw error;
            });
    }

    setManagerID(managerAccountName) {
        return this.getUserID(managerAccountName).then((response) => {
            if (response.status < 205) {
                this.context.currentUser.manager.id = response.data.Id;
                return response;
            } else {
                throw response;
            }
        }, (error) => { throw error; });
    }

    getProperty(properties, property) {
        property = properties.find(function (element) { return element.Key === property; });
        return property ? property.Value : "";
    }
    //#endregion

    //Tools
    defaultQueueResolve(responses, objectToReturnOnSuccess) {

        let isGood = true;
        let errors = [];

        for (var i = 0; i < responses.length; i++) {
            if (responses[i].status > 205) {
                isGood = false;
                errors.push(responses[i]);
            }
        }

        if (isGood)
            return objectToReturnOnSuccess;
        else
            throw {
                errors,
                status: 500  
            };
    }

    requestBuilder(_url) {

        var req = {
            method: 'GET',
            url: _url,
            headers: {
                "accept": "application/json;odata=nometadata"
            }
        };
        return req;
    }

}

export default usuarioRepository;