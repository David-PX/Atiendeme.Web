//SERVICIO DE MENSAJES
(function () {
    angular.module('atiendeme').service("notificationService", notificationService);

    function notificationService() {
        var self = this;

        initializeService();

        function initializeService() {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
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
                "hideMethod": "fadeOut"
            }
        }

        function showToast(message, title, type, config) {
            if (type === "success")
                toastr[type](message, title, config);
            else
                toastr[type](message, config);
        }

        //SWEET ALERT
        function showConfirmationSwal(title, text, type, allowEscapeKey, cancelButtonText, confirmButtonText) {
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

        function showSimpleSwal(title, text, type, allowEscapeKey) {
            return Swal.fire({
                title: title,
                html: text,
                icon: type,
                allowEscapeKey: allowEscapeKey || false
            });
        }
        //
        return {
            showToast: showToast,
            showConfirmationSwal: showConfirmationSwal,
            showSimpleSwal: showSimpleSwal
        };
    }
}());