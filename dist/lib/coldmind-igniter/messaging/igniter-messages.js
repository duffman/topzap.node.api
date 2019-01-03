"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const message_types_1 = require("@igniter/messaging/message-types");
const socket_io_types_1 = require("@igniter/coldmind/socket-io.types");
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
class IgniterMessage {
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
    ack() {
        let igniterMessage = new IgniterMessage(message_types_1.MessageType.Ack, this.id, null, this.tag);
        this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, igniterMessage);
        console.log("Ack Message Done");
    }
    reply(type, id, data = null) {
        let igniterMessage = new IgniterMessage(type, id, data, this.tag);
        console.log("Reply Message ::", igniterMessage);
        this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, igniterMessage);
    }
    error(error) {
        this.reply(message_types_1.MessageType.Error, "error", JSON.stringify(error));
    }
}
exports.IgniterMessage = IgniterMessage;
