"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const message_types_1 = require("@igniter/messaging/message-types");
const socket_io_types_1 = require("@igniter/coldmind/socket-io.types");
const cli_logger_1 = require("@cli/cli.logger");
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
    replyTyped(id, data) {
        this.reply(this.type, id, data);
    }
    reply(type, id, data = null) {
        let igniterMessage = new IgniterMessage(type, id, data, this.tag);
        cli_logger_1.Logger.logDebug("Reply Message ::", igniterMessage);
        this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, igniterMessage);
    }
    error(error) {
        this.reply(message_types_1.MessageType.Error, "error", JSON.stringify(error));
    }
    errorGeneric() {
        this.error(new Error("Error 50001: Internal screw-up!"));
    }
}
exports.IgniterMessage = IgniterMessage;
