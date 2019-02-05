"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const message_types_1 = require("@igniter/messaging/message-types");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
class PriceSearchService {
    constructor(serviceClient) {
        this.serviceClient = serviceClient;
    }
    doPriceSearch(code, sessId = null) {
        let messageData = {
            code: code
        };
        return this.serviceClient.sendAwaitMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, sessId);
    }
}
exports.PriceSearchService = PriceSearchService;
