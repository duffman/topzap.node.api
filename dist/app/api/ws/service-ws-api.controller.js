"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
const product_db_1 = require("@db/product-db");
const message_types_1 = require("@igniter/messaging/message-types");
class ServiceWsApiController {
    constructor(debugMode) {
        this.debugMode = debugMode;
        this.productDb = new product_db_1.ProductDb();
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onServiceMessage(mess) {
        let scope = this;
    }
    attachWSS(wss) {
        this.wss = wss;
        this.wss.onMessage(this.onClientMessage.bind(this));
    }
    /**
     * New Message from a User Session/Device
     * @param {IZynMessage} mess
     */
    onClientMessage(session, mess) {
        let scope = this;
        if (mess.id === zap_message_types_1.ZapMessageType.GetVendors) {
            this.onGetVendors(session, mess);
        }
    }
    onGetVendors(session, mess) {
        this.productDb.getVendors().then(res => {
            let zynMessage = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorsList, res, mess.tag);
            this.wss.sendMessageToSocket(session.id, zynMessage);
        }).catch(err => {
            this.wss.messError(session.id, mess, new Error("ERROR_GETTING_VENDORS"));
        });
    }
    initRoutes(routes) { }
}
exports.ServiceWsApiController = ServiceWsApiController;
