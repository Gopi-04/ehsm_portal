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

            // Attach route matcher to handle the argument
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("Dashboard").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            this._sEmployeeId = sEmployeeId; // Store for navigation
            this._loadDashboardData(sEmployeeId);
        },

        _loadDashboardData: function (sEmployeeId) {
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            console.log("Loading Dashboard for Employee:", sEmployeeId);

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
            // Ideally should filter by EmployeeId if supported
            var sUrl = "/sap/opu/odata/sap/ZEHSM_PORTAL_GP_SRV/ZEHSM_INCIDENT_GPSet";
            $.ajax({
                url: sUrl,
                method: "GET",
                headers: { "Accept": "application/xml" },
                dataType: "text",
                success: function (sText) {
                    // Simple regex count
                    var count = (sText.match(/<entry>/g) || []).length;
                    if (count === 0) count = (sText.match(/<atom:entry>/g) || []).length;
                    that.getView().getModel().setProperty("/IncidentCount", count);
                }
            });

            // Count Risks
            var sRiskUrl = "/sap/opu/odata/sap/ZEHSM_PORTAL_GP_SRV/ZEHSM_RISK_GPSet";
            $.ajax({
                url: sRiskUrl,
                method: "GET",
                headers: { "Accept": "application/xml" },
                dataType: "text",
                success: function (sText) {
                    var count = (sText.match(/<entry>/g) || []).length;
                    if (count === 0) count = (sText.match(/<atom:entry>/g) || []).length;
                    that.getView().getModel().setProperty("/RiskCount", count);
                }
            });
        },

        onIncidentPress: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Incidents", {
                employeeId: this._sEmployeeId || "00000001"
            });
        },

        onRiskPress: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Risks", {
                employeeId: this._sEmployeeId || "00000001"
            });
        },

        onLogout: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Login");
        }
    });
});
