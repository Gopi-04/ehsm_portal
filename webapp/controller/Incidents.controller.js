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
            var sUrl = "/sap/opu/odata/sap/ZEHSM_PORTAL_GP_SRV/ZEHSM_INCIDENT_GPSet";

            console.log("Fetching XML from:", sUrl);

            $.ajax({
                url: sUrl,
                method: "GET",
                headers: {
                    "Accept": "application/xml"
                },
                dataType: "xml",
                success: function (xmlDoc) {
                    console.log("XML Response received");
                    var aIncidents = [];

                    // Native DOM Parsing to avoid jQuery Namespace issues
                    var entries = xmlDoc.getElementsByTagName("entry");
                    // If no entries found directly, try namespaced version (browsers vary)
                    if (entries.length === 0) entries = xmlDoc.getElementsByTagName("atom:entry");

                    console.log("Found entry elements:", entries.length);

                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];

                        // Find properties container (m:properties)
                        var properties = entry.getElementsByTagName("m:properties")[0];
                        if (!properties) properties = entry.getElementsByTagName("properties")[0]; // Fallback

                        // If still not found, search all children for localName 'properties'
                        if (!properties) {
                            var children = entry.getElementsByTagName("content")[0].children;
                            for (var j = 0; j < children.length; j++) {
                                if (children[j].localName === "properties") {
                                    properties = children[j];
                                    break;
                                }
                            }
                        }

                        if (properties) {
                            var incident = {
                                IncidentId: that._getTagValue(properties, "d:IncidentId") || that._getTagValue(properties, "IncidentId"),
                                IncidentDescription: that._getTagValue(properties, "d:IncidentDescription") || that._getTagValue(properties, "IncidentDescription"),
                                IncidentStatus: that._getTagValue(properties, "d:IncidentStatus") || that._getTagValue(properties, "IncidentStatus"),
                                IncidentPriority: that._getTagValue(properties, "d:IncidentPriority") || that._getTagValue(properties, "IncidentPriority"),
                                IncidentDate: that._getTagValue(properties, "d:IncidentDate") || that._getTagValue(properties, "IncidentDate"),
                                Plant: that._getTagValue(properties, "d:Plant") || that._getTagValue(properties, "Plant")
                            };

                            // Parse Date if needed
                            if (incident.IncidentDate) {
                                incident.IncidentDate = new Date(incident.IncidentDate);
                            }

                            aIncidents.push(incident);
                        }
                    }

                    console.log("Parsed " + aIncidents.length + " incidents from XML");

                    if (aIncidents.length > 0) {
                        var oIncidentsModel = new JSONModel(aIncidents);
                        that.getView().setModel(oIncidentsModel, "incidents");
                        MessageToast.show("Loaded " + aIncidents.length + " incidents");
                    } else {
                        MessageToast.show("XML parsed but 0 incidents extracted");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("XML Load Error:", textStatus, errorThrown);
                    MessageToast.show("Request Failed: " + errorThrown);
                }
            });
        },

        _getTagValue: function (parent, tagName) {
            // Try standard getElementsByTagName
            var elements = parent.getElementsByTagName(tagName);

            // If failed, try ignoring namespace prefix (localName check)
            if (elements.length === 0 && tagName.indexOf(":") > -1) {
                var localName = tagName.split(":")[1];
                var allChildren = parent.children || parent.childNodes;
                for (var k = 0; k < allChildren.length; k++) {
                    var node = allChildren[k];
                    // Check localName or nodeName
                    if ((node.localName === localName) || (node.nodeName && node.nodeName.endsWith(":" + localName))) {
                        return node.textContent || node.text;
                    }
                }
            }

            if (elements.length > 0) {
                return elements[0].textContent || elements[0].text;
            }
            return "";
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
