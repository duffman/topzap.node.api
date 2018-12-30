"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const id_generator_1 = require("../id-generator");
const event_types_1 = require("@igniter/messaging/event-types");
class BroadcastMessage {
    constructor(originHost, originPort, id = -1) {
        this.originHost = originHost;
        this.originPort = originPort;
        this.id = id;
        this.data = null;
        if (id < 1) {
            id = id_generator_1.IdGenerator.newId();
        }
        this.data = {
            type: event_types_1.EventType.Broadcast,
            action: event_types_1.EventType.Actions.Connect
        };
    }
}
exports.BroadcastMessage = BroadcastMessage;
class DiscoveryMessData {
    constructor(host, port, data) {
        this.host = host;
        this.port = port;
        this.data = data;
    }
}
exports.DiscoveryMessData = DiscoveryMessData;
// Converts JSON strings to/from your types
var DataConvert;
(function (DataConvert) {
    function toDiscoveryMessData(json) {
        return JSON.parse(json);
    }
    DataConvert.toDiscoveryMessData = toDiscoveryMessData;
    function discoveryMessDataToJson(value) {
        return JSON.stringify(value);
    }
    DataConvert.discoveryMessDataToJson = discoveryMessDataToJson;
})(DataConvert = exports.DataConvert || (exports.DataConvert = {}));
