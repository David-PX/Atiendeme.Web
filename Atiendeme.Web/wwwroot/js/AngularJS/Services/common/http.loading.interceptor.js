class httpLoadingInterceptor {

    constructor($q, $rootScope, $window) {

        this.$q = $q;
        this.$rootScope = $rootScope;
        this.reqIteration = 0;
        this.$window = $window;

    }

    request = (config) => {

        let canGo = config.url ? !config.url.includes(`('Logs'))`) ? true : false : true;
        //IGNORE THE LOG ERRORS
        if (canGo) {

            // Firing event only if current request was the first, SP Loading alredy charge and is not alredy set
            if (this.reqIteration === 0 && SP.UI.ModalDialog && document.getElementsByClassName("ms-dlgFrameContainer").length === 0) {
                this.$window.parent.eval("window.waitDialog = SP.UI.ModalDialog.showWaitScreenWithNoClose('Procesando...', 'Por favor, espere.');");
            }
            // Increasing request iteration
            this.reqIteration++;
        }
        return config || this.$q.when(config);
    }

    response = (config) => {
        // Decreasing request iteration
        let  canGo = config.url ? !config.url.includes(`('Logs'))`) ? true : false : true;
        //IGNORE THE LOG ERRORS
        if (canGo) {
            this.reqIteration--;
            // Firing event only if current response was came to the last request
            if (this.reqIteration === 0) {
                if (SP.UI.ModalDialog) {
                    if (document.getElementsByClassName("ms-dlgFrameContainer").length > 0)
                        this.$window.parent.waitDialog.close();
                }
            }
        }
        return config || this.$q.when(config);
    }

    responseError = (config) => {

        this.reqIteration--;
        // Firing event only if current response was came to the last request
        if (this.reqIteration === 0) {
            if (SP.UI.ModalDialog) {
                if (document.getElementsByClassName("ms-dlgFrameContainer").length > 0)
                    this.$window.parent.waitDialog.close();
            }
        }

        return config || this.$q.reject(config);
    }

}

// Injecting our custom loader interceptor



export default httpLoadingInterceptor; 