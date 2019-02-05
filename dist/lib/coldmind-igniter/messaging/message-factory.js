"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const uuid4 = require("uuid/v4");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
class MessageFactory {
    static newIgniterMessage(messageType, messageId, data = null, tag = null) {
        //data = data === null ? {} : data;
        tag = tag === null ? uuid4() : tag;
        let message = new igniter_messages_1.ZynMessage(messageType, messageId, data, tag);
        return message;
    }
}
exports.MessageFactory = MessageFactory;
