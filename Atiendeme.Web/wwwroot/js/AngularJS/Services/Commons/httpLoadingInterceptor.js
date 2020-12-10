app.factory('httpLoadingInterceptor', function ($q, $rootScope, $log) {
    var numLoadings = 0;

    return {
        request: function (config) {
            if (numLoadings === 0)
                $('#loader').css('display', 'block');

            numLoadings++;
            return config || $q.when(config)
        },

        response: function (response) {
            if ((--numLoadings) === 0)
                $('#loader').css('display', 'none');

            return response || $q.when(response);
        },
        responseError: function (response) {
            if ((--numLoadings) === 0)
                $('#loader').css('display', 'none');
            return $q.reject(response);
        }
    };
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpLoadingInterceptor');
});