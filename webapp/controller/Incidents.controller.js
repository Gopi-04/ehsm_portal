sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function (Controller, UIComponent, History, MessageToast) {
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
            console.log("=== Incidents Controller Initialized ===");
            var oModel = this.getOwnerComponent().getModel();
            console.log("OData Model:", oModel);
            console.log("Service URL:", oModel.sServiceUrl);

            var that = this;

            // Try to read incidents
            console.log("Attempting to read /ZEHSM_INCIDENT_GPSet...");
            oModel.read("/ZEHSM_INCIDENT_GPSet", {
                success: function (oData) {
                    console.log("✓ SUCCESS - Incidents loaded:", oData);
                    console.log("Number of incidents:", oData.results ? oData.results.length : 0);
                    if (oData.results && oData.results.length > 0) {
                        MessageToast.show("Loaded " + oData.results.length + " incident(s)");
                    } else {
                        MessageToast.show("No incidents found in backend");
                    }
                },
                error: function (oError) {
                    console.error("✗ ERROR loading incidents:", oError);
                    console.error("Status Code:", oError.statusCode);
                    console.error("Response:", oError.responseText);
                    MessageToast.show("Error loading incidents: " + (oError.message || oError.statusCode));
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
