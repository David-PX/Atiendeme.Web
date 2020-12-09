import angular from 'angular';

var config = {
    //List Names
    listNames: {
        messagesList: "MensajesAplicacion",
        expense: {
            SolicitudesReportesGastos: "SolicitudesReportesGastos",
            SolicitudesReportesGastosMetadata: { "type": "SP.Data.SolicitudesReportesGastosListItem" },

            SRGFacturas: "SRG-Facturas",
            SRGFacturasMetadata: { "type": "SP.Data.SRGFacturasListItem" },

            //

            SRGTransporte: "SRG-Transporte",
            SRGTransporteMetadata: { "type": "SP.Data.SRGTransporteListItem" },

            SRGVehiculos: "SRG-Vehiculos",
            SRGVehiculosMetadata: { "type": "SP.Data.SRGVehiculosListItem" },

            SRGOtrosGastos: "SRG-OtrosGastos",
            SRGOtrosGastosMetadata: { "type": "SP.Data.SRGOtrosGastosListItem" },

            SRGAprobaciones: "SRG-Aprobaciones",
            SRGAprobacionesMetadata: { "type": "SP.Data.SRGAprobacionesListItem" },

            SRGHospedaje: "SRG-Hospedaje",
            SRGHospedajeMetadata: { "type": "SP.Data.SRGHospedajeListItem" },
            //
            SRGDocumentos: "SRG-Documentos",
            SRGDocumentosWithoutScore: "SRGDocumentos",
            SRGDocumentosMetadata: { "type": "SP.Data.SRGDocumentosItem" },

            Comunes: "Comunes"
        },
        Logs: "Logs",
        LogsMetadata: { "type": "SP.Data.LogsListItem" }
    },
    regex: {
        extensionReg: /(?:\.([^.]+))?$/,
        numberMayorThanZero: /^[1-9][0-9]*$/,
        email: /([^@]+)/
    },
    googleAPIOptions: {
        componentRestrictions: { country: 'DO' }
    },

    siteEndPoint: "https://cardnetdo.sharepoint.com/",
    ComponentName: "Reporte Gastos",
    //Error handler declaration
    appErrorPrefix: '[SYSERR]',

    //app version
    version: '1.0.0.4',
    //debug notification settings
    showDebugNotiSetting: true
};

angular.module("atiendeme").constant('config', config);
