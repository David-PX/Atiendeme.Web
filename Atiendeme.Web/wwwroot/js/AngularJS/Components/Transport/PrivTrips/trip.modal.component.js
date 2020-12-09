import tripModal from './trip.modal.html';
import tripModalController from './trip.modal.controller';

var tripModalComponent = {
    angularName: "tripModalComponent",
    template: tripModal,
    controller: tripModalController,
    controllerAs: 'privTrip',

    bindings: {
        tripDatesOnConflict: "<",
        lodgementTypes: "<"
    } 
};

export default tripModalComponent; 