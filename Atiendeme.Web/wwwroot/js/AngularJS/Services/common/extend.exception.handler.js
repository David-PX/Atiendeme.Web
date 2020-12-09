//NOT IN USE

const extendExceptionHandler = ($delegate) => {
    return function (exception, cause) {
        $delegate(exception, cause);
        var errorData = {
            exception: exception,
            cause: cause
        };
        /**
         * Could add the error to a service's collection,
         * add errors to $rootScope, log errors to remote web server,
         * or log locally. Or throw hard. It is entirely up to you.
         * throw exception;
         */
        
        console.error("Error");
    };
};

export default extendExceptionHandler;