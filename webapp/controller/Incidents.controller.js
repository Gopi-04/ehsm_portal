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
            console.log("=== Loading Incidents from Backend ===");
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // Read all incidents from backend
            oModel.read("/ZEHSM_INCIDENT_GPSet", {
                success: function (oData) {
                    console.log("✓ SUCCESS - Loaded incidents:", oData);
                    var aIncidents = oData.results || [];
                    console.log("Number of incidents:", aIncidents.length);

                    // Create JSON model with backend data
                    var oIncidentsModel = new JSONModel(aIncidents);
                    that.getView().setModel(oIncidentsModel, "incidents");

                    MessageToast.show("Loaded " + aIncidents.length + " incident(s) from backend");
                },
                error: function (oError) {
                    console.error("✗ ERROR loading incidents:", oError);
                    MessageToast.show("Error: " + (oError.message || oError.statusCode));
                }
            });
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
