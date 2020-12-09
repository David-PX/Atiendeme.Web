//SERVICIO DE MENSAJES
class messageService {

    constructor(config, $timeout, $http, notificationService) {

        this.config = config;
        this.$timeout = $timeout;
        this.messages = [];
        this.currentComponentMsgs = [];
        this.$http = $http;

        this.notificationService = notificationService;
        this.getMessages();

        this.searcFinished = false;
    }

    getMessages() {

        var req = {
            method: 'GET',
            //FILTRA POR CATEGORIA, EN CASO DE QUE NO EXISTAN CATEGORIAS EDITAR AQUI
            url: _spPageContextInfo.siteAbsoluteUrl + "/_api/web/lists/GetByTitle('" + this.config.listNames.messagesList + "')/items?$filter=Categoria eq 'General' or Categoria eq '" + this.config.ComponentName + "'",
            headers: {
                "accept": "application/json;odata=nometadata"
            }
        };
        return this.$http(req).then(
            (response) => {
                this.searcFinished = true;
                if (response.data.value.length > 0) {

                    //LISTA CON TODOS LOS MENSAJES
                    this.messages = response.data.value;

                    //LISTA UNICAMENTE CON LOS MENSAJES DE LA CATEGORIA ACTUAL
                    this.currentComponentMsgs = this.messages.filter((mensaje) => { return mensaje.Categoria === this.config.ComponentName; });
                    return response;
                } else {
                    return [{ Header: "Error de Conexión", Contenido: "Error al intentar conectarse al sistema.", tipo: "error" }];
                }
            }, (error) => {
                console.error(error);
                this.messages = [{ Header: "Error de Conexión", Contenido: "Error al intentar conectarse al sistema.", tipo: "error" }];
                return error;
            });
    }

    findMensaje(title) {

        var msgFinded;
        //LOS MENSAJES DE LA CATEGORIA ACTUAL TIENEN PRIORIDAD SOBRE LOS MENSAJES GENERALES O DE CUALQUIER OTRA CATEGORIA QUE SE ENCUENTRE
        if (this.currentComponentMsgs.length > 0)
            msgFinded = this.currentComponentMsgs.find((msg) => { return msg.Title === title; });

        if (this.currentComponentMsgs.length < 1 || !msgFinded)
            msgFinded = this.messages.find((msg) => { return msg.Title === title; });

        if (!msgFinded) {
            msgFinded = { Header: "Error Conexión", Contenido: "Error al intentar contactar el sistema.", tipo: "error" };
        }

        return msgFinded;
    }

    GetMessage(title) {

        if (this.searcFinished) {

            //RETORNA UN PROMISE CON EL MENSAJE, SI EL MENSAJE YA HA SIDO CARGADO RETORNARA EL MENSAJE INMEDIATAMENTE
            return this.$timeout(() => {
                var msg = this.findMensaje(title);
                return msg;
            });
        }
        else {
            return this.$timeout(() => {
                return this.GetMessage(title);
            }, 500);
        }
    }

    getMessageAndShowToastr(messageTitle, sendLog, errorToLog, config) {

        //Return promise in case we want to do an action after
        return this.GetMessage(messageTitle).then(response => {

            if (response.tipo === "error" && sendLog)
                this.notificationService.showToastErrorAndSendLog(response.Contenido, config || {}, errorToLog);
            else
                this.notificationService.showToast(response.Contenido, response.Header || "", response.tipo || "error", config || {});

            return response;
        });
    }
}

export default messageService;