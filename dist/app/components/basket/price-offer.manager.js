"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
const message_types_1 = require("@igniter/messaging/message-types");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
class PriceOfferManager {
    constructor(serviceClient, wss) {
        this.serviceClient = serviceClient;
        this.wss = wss;
    }
    emitGetOffersInit(sessId, data) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersInit, data, sessId);
        this.wss.sendToSession(sessId, mess);
    }
    emitVendorOffer(sessId, data) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorOffer, data, sessId);
        this.wss.sendToSession(sessId, mess);
    }
    emitOffersDone(sessId) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersDone, {}, sessId);
        this.wss.sendToSession(sessId, mess);
    }
}
exports.PriceOfferManager = PriceOfferManager;
