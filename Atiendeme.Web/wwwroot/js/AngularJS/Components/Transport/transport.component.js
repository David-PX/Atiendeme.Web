import transportController from './transport.controller';
import transportTemplate from './transport.component.html';

var transportComponent = {
    angularName: "transportComponent",
    template: transportTemplate,
    controller: transportController,
    controllerAs: "transport",
    bindings: {
        isEditable: "<"
    }
};

export default transportComponent; 