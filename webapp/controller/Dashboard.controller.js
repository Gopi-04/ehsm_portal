sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent"
], function (Controller, JSONModel, UIComponent) {
    "use strict";

    return Controller.extend("com.kaar.ehsm.controller.Dashboard", {
        onInit: function () {
            var oViewModel = new JSONModel({
                IncidentCount: 0,
                RiskCount: 0
            });
            this.getView().setModel(oViewModel);
            this._loadDashboardData();
        },

        _loadDashboardData: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel();
            var sEmployeeId = "00000001"; // Hardcoded to match valid user data

            // Load Profile
            var sProfilePath = oModel.createKey("/ZEHSM_PROFILE_GPSet", {
                EmployeeId: sEmployeeId
            });

            oModel.read(sProfilePath, {
                success: function (oData) {
                    var oProfileModel = new JSONModel(oData);
                    that.getView().setModel(oProfileModel, "profile");
                },
                error: function (oError) {
                    console.error("Error reading Profile", oError);
                }
            });

            // Count Incidents (Mock logic: just reading all and counting)
            // In real OData we might use $count or $inlinecount
            oModel.read("/ZEHSM_INCIDENT_GPSet", {
                success: function (oData) {
                    var iCount = oData.results ? oData.results.length : 0;
                    oViewModel.setProperty("/IncidentCount", iCount);
                },
                error: function (oError) {
                    console.error("Error reading Incidents", oError);
                }
            });

            // Count Risks
            oModel.read("/ZEHSM_RISK_GPSet", {
                success: function (oData) {
                    var iCount = oData.results ? oData.results.length : 0;
                    oViewModel.setProperty("/RiskCount", iCount);
                },
                error: function (oError) {
                    console.error("Error reading Risks", oError);
                }
            });
        },

        onIncidentPress: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Incidents");
        },

        onRiskPress: function () {
            // Placeholder for Risk Navigation
        },

        onLogout: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Login");
        },

        onNavBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Login");
        }
    });
});
