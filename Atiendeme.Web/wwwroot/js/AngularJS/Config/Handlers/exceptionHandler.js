import angular from 'angular';
import Swal from 'sweetalert2';

angular.module('expenseReport').config(function ($provide) {

    $provide.decorator('$exceptionHandler', function ($delegate) {
        return function (exception, cause) {
            debugger;
            $delegate(exception, cause);
            //TODO: Add fetch for post in log
            Swal.fire(
                'Ha ocurrido un error interno.',
                'Ha ocurrido un error interno y este no ha podido ser registrado. Favor contactar con Tecnología para obtener mas información.',
                'error'
            );
        };
    });
}); 