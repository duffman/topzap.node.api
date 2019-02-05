"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
// Converts JSON strings to/from your types
var IgniterMessageType;
(function (IgniterMessageType) {
    function toIgniterMessageType(json) {
        return JSON.parse(json);
    }
    IgniterMessageType.toIgniterMessageType = toIgniterMessageType;
    function igniterMessageTypeToJson(value) {
        return JSON.stringify(value);
    }
    IgniterMessageType.igniterMessageTypeToJson = igniterMessageTypeToJson;
})(IgniterMessageType = exports.IgniterMessageType || (exports.IgniterMessageType = {}));
class ZynMessage {
    constructor(type, id, data, tag = null) {
        this.type = type;
        this.id = id;
        this.data = data;
        this.tag = tag;
    }
    is(type) {
        return (this.type === type);
    }
    idIs(id) {
        return (this.id === id);
    }
}
exports.ZynMessage = ZynMessage;
