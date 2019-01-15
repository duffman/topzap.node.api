"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
class ProductWsApiController {
    attachWSS(wss) {
        this.wss = wss;
        this.wss.onMessage(this.onUserMessage.bind(this));
    }
    /**
     * New Message from a User Session/Device
     * @param {IZynMessage} mess
     */
    onUserMessage(mess) {
        if (mess.id === zap_message_types_1.ZapMessageType.GetVendors) {
        }
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    /**
     * New Message from Search Service
     * @param {IZynMessage} mess
     */
    onServiceMessage(mess) {
    }
    initRoutes(routes) {
    }
}
exports.ProductWsApiController = ProductWsApiController;
