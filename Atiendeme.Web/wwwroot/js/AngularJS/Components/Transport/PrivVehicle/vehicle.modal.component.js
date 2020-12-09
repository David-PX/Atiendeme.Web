import vehicleModal from './vehicle.modal.html';
import vehicleController from './vehicle.modal.controller';

var vehicleModalComponent = {
    angularName: "vehicleModalComponent",
    template: vehicleModal,
    controller: vehicleController,
    controllerAs: "vehicle",
    //require: {
    //    parentCtrl: '^^transportComponent'
    //}
    bindings: {
        allVehiclesHaveLogicalDeleted: "<",
        isEditable: "<",
        vehicleTypes: "<",
        propertyTypes: "<"

    }
};

export default vehicleModalComponent; 