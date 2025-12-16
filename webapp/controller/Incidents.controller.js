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
            this._loadIncidentsAsXML();
        },

        _loadIncidentsAsXML: function () {
            var that = this;
            // Add a timestamp to prevent caching
            var sUrl = "/sap/opu/odata/sap/ZEHSM_PORTAL_GP_SRV/ZEHSM_INCIDENT_GPSet?ts=" + new Date().getTime();

            console.log("Fetching XML from:", sUrl);

            $.ajax({
                url: sUrl,
                method: "GET",
                headers: {
                    "Accept": "application/xml, text/xml, */*"
                },
                dataType: "xml", // FORCE XML parsing
                success: function (xmlDoc) {
                    console.log("XML Response received");
                    var $xml = $(xmlDoc);
                    var aIncidents = [];

                    // Parse Atom/XML feed manually
                    $xml.find("entry").each(function () {
                        var $entry = $(this);
                        var $props = $entry.find("m\\:properties, properties"); // Handle namespaces

                        // Fallback if jQuery namespace selector fails
                        if ($props.length === 0) $props = $entry.find("content").children().first();

                        var incident = {
                            IncidentId: that._getNodeValue($props, "d\\:IncidentId, IncidentId"),
                            IncidentDescription: that._getNodeValue($props, "d\\:IncidentDescription, IncidentDescription"),
                            IncidentStatus: that._getNodeValue($props, "d\\:IncidentStatus, IncidentStatus"),
                            IncidentPriority: that._getNodeValue($props, "d\\:IncidentPriority, IncidentPriority"),
                            IncidentDate: that._getNodeValue($props, "d\\:IncidentDate, IncidentDate"),
                            Plant: that._getNodeValue($props, "d\\:Plant, Plant")
                        };

                        // Parse Date if string
                        if (incident.IncidentDate && typeof incident.IncidentDate === "string") {
                            // Assuming YYYY-MM-DD format from XML like 2025-08-19T00:00:00
                            incident.IncidentDate = new Date(incident.IncidentDate);
                        }

                        aIncidents.push(incident);
                    });

                    console.log("Parsed " + aIncidents.length + " incidents from XML");

                    if (aIncidents.length > 0) {
                        var oIncidentsModel = new JSONModel(aIncidents);
                        that.getView().setModel(oIncidentsModel, "incidents");
                        MessageToast.show("Loaded " + aIncidents.length + " incidents (XML)");
                    } else {
                        // Fallback: try finding 'd:IncidentId' directly in document
                        MessageToast.show("XML received but 0 entries found");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("XML Load Error:", textStatus, errorThrown);
                    MessageToast.show("XML Request Failed: " + errorThrown);
                }
            });
        },

        // Helper to handle XML namespaces safely
        _getNodeValue: function ($parent, selector) {
            var $node = $parent.find(selector);
            if ($node.length === 0) {
                // Try selecting by tag name ignoring namespace
                var tagName = selector.split(",").pop().trim();
                $node = $parent.find(tagName);
                // Also search children directly (for m:properties structure)
                if ($node.length === 0) {
                    $parent.children().each(function () {
                        if (this.nodeName.indexOf(tagName) !== -1 || this.nodeName.endsWith(":" + tagName)) {
                            $node = $(this);
                            return false;
                        }
                    });
                }
            }
            return $node.text();
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
            // Future implementation
        }
    });
});
