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
    emitGetOffersInit(socketId, data) {
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersInit, data, socketId);
        this.wss.sendMessageToSocket(socketId, mess);
    }
    emitVendorOffer(socketId, data) {
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorOffer, data, socketId);
        this.wss.sendMessageToSocket(socketId, mess);
    }
    emitOffersDone(socketId) {
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersDone, {}, socketId);
        this.wss.sendMessageToSocket(socketId, mess);
    }
}
exports.PriceOfferManager = PriceOfferManager;
