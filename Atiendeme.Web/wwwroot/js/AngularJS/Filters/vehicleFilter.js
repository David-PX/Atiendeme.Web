import angular from 'angular';

angular.
    module('expenseReport').
    filter('vehicleFilter', [function () {

        return function (vehicle) {
            var array = [];
            angular.forEach(vehicle, function (_vehicle) {
                if (!_vehicle.deleted)
                    array.push(_vehicle);
            });
            return array;
        };
    }]);