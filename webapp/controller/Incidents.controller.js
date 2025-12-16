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
            var sEmployeeId = "00000001"; // Hardcoded for now
            var that = this;

            // Since EmployeeId is the key, we need to read the specific entity
            var sPath = "/ZEHSM_INCIDENT_GPSet('" + sEmployeeId + "')";
            console.log("Reading incident for path:", sPath);

            oModel.read(sPath, {
                success: function (oData) {
                    console.log("✓ SUCCESS - Incident data:", oData);
                    MessageToast.show("Incident loaded: " + oData.IncidentId);

                    // Bind the single incident to the table
                    var oTable = that.getView().byId("incidentsTable");
                    oTable.bindItems({
                        path: "/",
                        template: oTable.getBindingInfo("items").template,
                        model: new sap.ui.model.json.JSONModel([oData])
                    });
                },
                error: function (oError) {
                    console.error("✗ ERROR:", oError);
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
