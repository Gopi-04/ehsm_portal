sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, History, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("com.kaar.ehsm.controller.Incidents", {
        formatter: {
            statusState: function (sStatus) {
                switch (sStatus) {
                    case "Open": return "Error";
                    case "In Progress": return "Warning";
                    case "Closed": return "Success";
                    default: return "None";
                }
            },
            priorityState: function (sPriority) {
                switch (sPriority) {
                    case "High": return "Error";
                    case "Medium": return "Warning";
                    case "Low": return "Success";
                    default: return "None";
                }
            }
        },

        onInit: function () {
            // Hardcoded incident data from your backend XML
            // Since backend doesn't support GET_ENTITYSET, we'll fetch it directly
            var aIncidents = [
                {
                    EmployeeId: "00000001",
                    IncidentId: "INC000001",
                    Plant: "AT01",
                    IncidentDescription: "Chemical leak in storage",
                    IncidentCategory: "Safety",
                    IncidentPriority: "High",
                    IncidentStatus: "Open",
                    IncidentDate: new Date("2025-08-19"),
                    IncidentTime: "PT08H33M24S",
                    CreatedBy: "K901604",
                    CompletionDate: "0000-00-00",
                    CompletionTime: "PT00H00M00S"
                }
            ];

            // Create and set model
            var oIncidentsModel = new JSONModel(aIncidents);
            this.getView().setModel(oIncidentsModel, "incidents");

            MessageToast.show("Loaded " + aIncidents.length + " incident(s)");
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("Dashboard", {}, true);
            }
        },

        onIncidentItemPress: function (oEvent) {
            // Future implementation for Detail View
        }
    });
});
