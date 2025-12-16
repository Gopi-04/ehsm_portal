sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.kaar.ehsm.controller.Login", {
        onInit: function () {
            // Initialization logic if needed
        },

        onLoginPress: function () {
            var oUserIdInput = this.getView().byId("userIdInput");
            var oPasswordInput = this.getView().byId("passwordInput");
            var sUserId = oUserIdInput.getValue();
            var sPassword = oPasswordInput.getValue();

            if (!sUserId || !sPassword) {
                MessageToast.show("Please enter both User ID and Password.");
                return;
            }

            // Mock OData validation
            var oModel = this.getOwnerComponent().getModel();
            var that = this;

            // Using ZEHSM_LOGIN_GPSet as per metadata
            oModel.read("/ZEHSM_LOGIN_GPSet", {
                filters: [
                    new Filter("EmployeeId", FilterOperator.EQ, sUserId)
                ],
                success: function (oData) {
                    var aUsers = oData.results;
                    if (aUsers && aUsers.length > 0) {
                        var oUser = aUsers[0];
                        if (oUser.Password === sPassword) {
                            MessageToast.show("Login Successful");
                            // Navigate to Dashboard
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("Dashboard");
                        } else {
                            MessageToast.show("Invalid Password");
                        }
                    } else {
                        MessageToast.show("User not found");
                    }
                },
                error: function (oError) {
                    MessageToast.show("Login Error: " + oError.message);
                }
            });
        }
    });
});
