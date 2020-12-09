import toastr from 'toastr'; //MOVE
import Swal from 'sweetalert2/dist/sweetalert2.all'; 

class notificationService {

    constructor($http, config, exceptionFactory) {
        this.$http = $http;
        this.config = config;
        this.exceptionFactory = exceptionFactory;


        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": true,
            "progressBar": true,
            "positionClass": "toast-top-right",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "300",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut",
            "escapeHTML": true
        };
    }


    //#region TOASTR
    showToast(message, title, type, config) {


        if (type === "success")
            toastr[type](message, title, config);
        else
            toastr[type](message, config);
    }

    showToastErrorAndSendLog(message, config, error) {
        toastr.error(message, config);
        //
        this.sendErrorToLogList(error);
    }
    //#endregion

    //#region Swal

    showConfirmationSwal(title, text, type, allowEscapeKey, cancelButtonText, confirmButtonText) {

        return Swal.fire({
            title: title,
            html: text,
            icon: type,
            allowEscapeKey: allowEscapeKey || false,
            showCancelButton: true,
            confirmButtonColor: '#0aa5b5', //Color static because of design
            cancelButtonColor: '#e34a57', //Color static because of design
            confirmButtonText: confirmButtonText || 'Confirmar',
            cancelButtonText: cancelButtonText || 'Rechazar'
        }).then(result => {

            return result.value ? true : false;
        });
    }

    showSimpleSwal(title, text, type, allowEscapeKey) {
        return Swal.fire({
            title: title,
            html: text,
            icon: type,
            allowEscapeKey: allowEscapeKey || false
        });
    }

    showSwalErrorAndSendLog(error, comment, errorType) {
         
        this.sendErrorToLogList(error, comment, errorType);

        return Swal.fire(
            'Ha ocurrido un error : (',
            'Favor contactar con Tecnología para obtener mas información.',
            'error'
        );
    }


    //#endregion

    //#ERROR SEND 
    sendErrorToLogList(error, comment, errorType) { 
        this.exceptionFactory.logError(JSON.stringify(error), comment, errorType || "");
    }

}

export default notificationService;