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
                dataType: "text", // FETCH AS TEXT TO ENABLE REGEX FALLBACK
                success: function (sResponseText) {
                    console.log("Response text received (" + sResponseText.length + " bytes)");
                    var aIncidents = [];

                    // STRATEGY 1: DOM Parser
                    try {
                        var parser = new DOMParser();
                        var xmlDoc = parser.parseFromString(sResponseText, "text/xml");
                        aIncidents = that._parseWithDOM(xmlDoc);
                        console.log("DOM Parser found " + aIncidents.length + " incidents");
                    } catch (e) {
                        console.error("DOM Parsing failed:", e);
                    }

                    // STRATEGY 2: Regex Fallback (if DOM failed)
                    if (aIncidents.length === 0) {
                        console.log("Falling back to Regex parsing...");
                        aIncidents = that._parseWithRegex(sResponseText);
                        console.log("Regex Parser found " + aIncidents.length + " incidents");
                    }

                    if (aIncidents.length > 0) {
                        var oIncidentsModel = new JSONModel(aIncidents);
                        that.getView().setModel(oIncidentsModel, "incidents");
                        MessageToast.show("Loaded " + aIncidents.length + " incidents");
                    } else {
                        MessageToast.show("No data found in response");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Load Error:", textStatus, errorThrown);
                    MessageToast.show("Request Failed: " + errorThrown);
                }
            });
        },

        _parseWithDOM: function (xmlDoc) {
            var aIncidents = [];
            var entries = xmlDoc.getElementsByTagName("entry");
            if (entries.length === 0) entries = xmlDoc.getElementsByTagName("atom:entry");

            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var incident = {
                    IncidentId: this._findValue(entry, "IncidentId"),
                    IncidentDescription: this._findValue(entry, "IncidentDescription"),
                    IncidentStatus: this._findValue(entry, "IncidentStatus"),
                    IncidentPriority: this._findValue(entry, "IncidentPriority"),
                    IncidentDate: this._findValue(entry, "IncidentDate"),
                    Plant: this._findValue(entry, "Plant")
                };

                if (incident.IncidentId) {
                    if (incident.IncidentDate) incident.IncidentDate = new Date(incident.IncidentDate);
                    aIncidents.push(incident);
                }
            }
            return aIncidents;
        },

        _parseWithRegex: function (sText) {
            var aIncidents = [];
            // Split by <entry> or <atom:entry>
            var aParts = sText.split(/<\/?(?:atom:)?entry>/);

            for (var i = 0; i < aParts.length; i++) {
                var sPart = aParts[i];
                // Check if this part contains properties
                if (sPart.indexOf("IncidentId") === -1) continue;

                var incident = {
                    IncidentId: this._extractTag(sPart, "IncidentId"),
                    IncidentDescription: this._extractTag(sPart, "IncidentDescription"),
                    IncidentStatus: this._extractTag(sPart, "IncidentStatus"),
                    IncidentPriority: this._extractTag(sPart, "IncidentPriority"),
                    IncidentDate: this._extractTag(sPart, "IncidentDate"),
                    Plant: this._extractTag(sPart, "Plant")
                };

                if (incident.IncidentId) {
                    if (incident.IncidentDate) incident.IncidentDate = new Date(incident.IncidentDate);
                    aIncidents.push(incident);
                }
            }
            return aIncidents;
        },

        _extractTag: function (sText, sTagName) {
            // Regex to find <d:TagName>Value</d:TagName> or <TagName>Value</TagName>
            // Handles potential namespaces like d: or m:
            var regex = new RegExp("<(?:\\w+:)" + sTagName + "[^>]*>(.*?)<\\/(?:\\w+:)" + sTagName + ">", "i");
            var match = sText.match(regex);
            if (match && match[1]) return match[1];

            // Try without namespace
            var regex2 = new RegExp("<" + sTagName + "[^>]*>(.*?)<\\/" + sTagName + ">", "i");
            var match2 = sText.match(regex2);
            if (match2 && match2[1]) return match2[1];

            return "";
        },

        _findValue: function (node, targetLocalName) {
            if (!node) return "";
            var nodeName = node.localName || node.nodeName;
            if (nodeName.indexOf(":") > -1) nodeName = nodeName.split(":")[1];

            if (nodeName === targetLocalName) return node.textContent || node.text || "";

            var children = node.children || node.childNodes;
            for (var i = 0; i < children.length; i++) {
                var found = this._findValue(children[i], targetLocalName);
                if (found) return found;
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
