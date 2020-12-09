import publicTripModal from './publicTrip.modal.html';
import publicTripModalController from './publicTrip.modal.controller';

var publicTripModalComponent = {
    angularName: "publicTripModalComponent",
    template: publicTripModal,
    controller: publicTripModalController,
    controllerAs: 'publicTrip',
    bindings: {
        tripDatesOnConflict: "<",
        publicVehiclesType: "<",
        lodgementTypes: "<"
    } 
};

export default publicTripModalComponent; 