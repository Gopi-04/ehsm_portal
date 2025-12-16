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
            this._loadIncidentsDirectly();
        },

        _loadIncidentsDirectly: function () {
            var that = this;
            var sUrl = "/sap/opu/odata/sap/ZEHSM_PORTAL_GP_SRV/ZEHSM_INCIDENT_GPSet";

            // Explicitly fetch using AJAX to bypass OData model key constraints
            // (Metadata defines EmployeeId as key, but multiple incidents exist per employee)
            $.ajax({
                url: sUrl,
                method: "GET",
                dataType: "json",
                success: function (oData) {
                    console.log("AJAX Success:", oData);
                    var aResults = [];

                    // Handle different OData JSON formats (d.results or just d)
                    if (oData && oData.d) {
                        if (oData.d.results) {
                            aResults = oData.d.results;
                        } else if (Array.isArray(oData.d)) {
                            aResults = oData.d;
                        }
                    }

                    if (aResults.length > 0) {
                        var oIncidentsModel = new JSONModel(aResults);
                        that.getView().setModel(oIncidentsModel, "incidents");
                        MessageToast.show("Loaded " + aResults.length + " incidents from Backend");
                    } else {
                        MessageToast.show("Backend returned 0 incidents");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("AJAX Error:", textStatus, errorThrown);
                    MessageToast.show("Connection Failed: " + textStatus);
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
