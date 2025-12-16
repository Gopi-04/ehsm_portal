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

            // Using Key-based read as Filter-based (GET_ENTITYSET) is not implemented in backend (501 error)
            var sPath = oModel.createKey("/ZEHSM_LOGIN_GPSet", {
                EmployeeId: sUserId,
                Password: sPassword
            });

            oModel.read(sPath, {
                success: function (oData) {
                    // oData will be the single entity object
                    if (oData && oData.EmployeeId) {
                        if (oData.Status === "Success" || oData.Status === "Active") {
                            MessageToast.show("Login Successful");
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("Dashboard", {
                                employeeId: sUserId
                            });
                        } else {
                            // Check if status is failure or something else provided by backend
                            MessageToast.show("Login Failed. Status: " + oData.Status);
                        }
                    } else {
                        MessageToast.show("User not found");
                    }
                },
                error: function (oError) {
                    // 404 means entity not found (invalid credentials in this context)
                    try {
                        var oErrorResponse = JSON.parse(oError.responseText);
                        MessageToast.show("Login Error: " + (oErrorResponse.error.message.value || oError.message));
                    } catch (e) {
                        MessageToast.show("Invalid Credentials or Login Error");
                    }
                }
            });
        }
    });
});
