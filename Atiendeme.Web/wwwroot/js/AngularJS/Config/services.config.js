import angular from 'angular';

//Commons
import exceptionFactory from '../Services/common/exceptionFactory';
import parametersService from '../Services/common/parameter.service';
import messageService from '../Services/common/message.service';
import notificationService from '../Services/common/notification.service';
//Repos
import usuarioRepository from '../Services/Repository/user.repository';
import cardnetRepository from '../Services/Repository/cardnet.repository';
import expenseRepository from '../Services/Repository/expense.repository';
import googleDistanceAPIRepository from '../Services/Repository/google.distance.API.repository';
import fileRepository from '../Services/Repository/files.repository';



angular.module('expenseReport')
    .service("parametersService", parametersService);

//repositories
angular.module('expenseReport')
    .service("usuarioRepository", usuarioRepository);


angular.module("atiendeme").
    service("cardnetRepository", cardnetRepository);

angular.module("atiendeme").
    service("expenseRepository", expenseRepository);

angular.module("atiendeme").
    service("googleDistanceAPIRepository", googleDistanceAPIRepository);

angular.module("atiendeme").
    service("fileRepository", fileRepository);

angular
    .module('expenseReport')
    .service('exceptionFactory', exceptionFactory);


//Common

angular.module("atiendeme").
    service("messageService", messageService);

angular.module("atiendeme").
    service("notificationService", notificationService);


