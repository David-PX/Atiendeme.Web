import angular from 'angular';
import httpLoadingInterceptor from '../Services/common/http.loading.interceptor';
import Swal from 'sweetalert2/dist/sweetalert2.all'; //Because of decorator

angular.module('expenseReport')
    .service('httpLoadingInterceptor', httpLoadingInterceptor);

angular.module('expenseReport').config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpLoadingInterceptor');
}]);


/*This is a decorator for unhandled exceptions. This exception can be sended to Log List, but for that
 * An normal XHR Request is needed, we cant use $http inside a decorator.
 */
angular.module('expenseReport').config(function ($provide) {

    $provide.decorator('$exceptionHandler', function ($delegate) {
        return function (exception, cause) {

            $delegate(exception, cause);

            Swal.fire(
                'Ha ocurrido un error interno.',
                'Ha ocurrido un error interno y este no ha podido ser registrado. Favor contactar con Tecnología para obtener mas información.',
                'error'
            );
        };
    });
});