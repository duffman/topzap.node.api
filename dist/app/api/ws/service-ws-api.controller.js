"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.wss.onMessage(this.onUserMessage.bind(this));
    }
    onUserMessage(mess) {
        let scope = this;
        if (mess.id === zap_message_types_1.ZapMessageType.GetVendors) {
            this.productDb.getVendors().then(res => {
                mess.reply(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorsList, res);
            }).catch(err => {
                mess.error(err);
            });
        }
    }
    initRoutes(routes) { }
}
exports.ServiceWsApiController = ServiceWsApiController;
