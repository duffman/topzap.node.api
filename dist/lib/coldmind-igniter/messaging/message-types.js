"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType.Ack = "ack";
    MessageType.Init = "init";
    MessageType.Action = "action";
    MessageType.Ping = "ping";
    MessageType.Pong = "ping";
    MessageType.Bye = "bye";
    MessageType.Error = "error";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
