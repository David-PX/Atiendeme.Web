var app = angular.module("atiendeme", ['ngRoute', 'moment-picker', "isteven-multi-select"]);

app = angular.module("atiendeme").config(function (momentPickerProvider) {
    momentPickerProvider.options({
        minutesStep: 30
    });
});