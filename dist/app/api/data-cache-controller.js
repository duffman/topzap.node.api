"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cached_offers_db_1 = require("@db/cached-offers-db");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
class DataCacheController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.cachedOffersDb = new cached_offers_db_1.CachedOffersDb();
    }
    initRoutes(routes) {
    }
    attachWSS(wss) {
        this.wss = wss;
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onServiceMessage(mess) {
        if (mess.id === zap_message_types_1.ZapMessageType.VendorOffer) {
            this.cachedOffersDb.cacheOffer(mess.data);
        }
    }
}
exports.DataCacheController = DataCacheController;
