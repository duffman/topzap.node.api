"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const zap_message_types_1 = require("@zapModels/zap-message-types");
const message_types_1 = require("@igniter/messaging/message-types");
const basket_handler_1 = require("@components/basket/basket.handler");
const session_manager_1 = require("@components/session-manager");
const message_factory_1 = require("@igniter/messaging/message-factory");
const product_db_1 = require("@db/product-db");
const get_offers_messages_1 = require("@zapModels/messages/get-offers-messages");
const cached_offers_db_1 = require("@db/cached-offers-db");
class BasketWsApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.productDb = new product_db_1.ProductDb();
        this.sessManager = new session_manager_1.SessionManager();
        this.basketHandler = new basket_handler_1.BasketHandler(this.sessManager);
        this.cachedOffersDb = new cached_offers_db_1.CachedOffersDb();
    }
    attachWSS(wss) {
        this.wss = wss;
        this.wss.onMessage((mess) => {
            let sessId = mess.socket.request.sessionID;
            if (mess.id === zap_message_types_1.ZapMessageType.BasketPull) {
                this.onBasketPull(sessId, mess);
            }
            if (mess.id === zap_message_types_1.ZapMessageType.BasketGet) {
                this.onBasketGet(sessId);
            }
            if (mess.id === zap_message_types_1.ZapMessageType.BasketRem) {
                this.onBasketRem(sessId, mess.data);
            }
            if (mess.id === zap_message_types_1.ZapMessageType.BasketAdd) {
                this.onBasketAdd(sessId, mess);
            }
        });
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
    doGetOffers(code, sessId) {
        let scope = this;
        console.log("doGetOffers :: " + code + " :: " + sessId);
        this.cachedOffersDb.getCachedOffers(code).then(res => {
            return res;
        }).catch(err => {
            console.log("doGetOffers :: Catch ::", err);
            return null;
        }).then((cachedRes) => {
            console.log("Final THEN ::", cachedRes);
            //
            // Simulate Messages Sent using a regular lookup
            //
            if (cachedRes) {
                scope.emitGetOffersInit(sessId, new get_offers_messages_1.GetOffersInit(cachedRes.length));
                for (const entry of cachedRes) {
                    scope.onMessVendorOffer(sessId, entry);
                    //scope.emitVendorOffer(sessId, entry);
                }
                scope.emitOffersDone(sessId);
                //
                // Lookup offers through the price service
                //
            }
            else {
                scope.emitGetOffersMessage(code, sessId); // Call price service
            }
        });
    }
    onBasketAdd(sessId, mess) {
        this.doGetOffers(mess.data.code, sessId);
        //this.emitGetOffersMessage(mess.data.code, sessId);
        mess.ack();
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onServiceMessage(mess) {
        let scope = this;
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersInit) {
            this.onMessOffersInit(mess.tag);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.VendorOffer) {
            this.onMessVendorOffer(mess.tag, mess.data);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersDone) {
            this.onMessOffersDone(mess.tag);
        }
    }
    onBasketGet(sessId) {
        console.log("onBasketGet");
        let bestBasket = this.basketHandler.getBestBasket(sessId);
        console.log("onBasketGet :: bestBasket");
        let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketGet, bestBasket);
        this.wss.sendToSession(sessId, message);
    }
    onBasketRem(sessId, data) {
    }
    onBasketPull(sessId, mess) {
        this.basketHandler.getExtSessionBasket(sessId).then(result => {
            let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketPull, result);
            this.wss.sendToSession(sessId, message);
        }).catch(err => {
            mess.error(err);
        });
    }
    onMessOffersInit(sessId) {
        console.log("BasketWsApiController :: onMessOffersInit ::", sessId);
    }
    onMessVendorOffer(sessId, data) {
        console.log("BasketWsApiController :: onMessVendorOffer :: " + sessId + " ::", data);
        this.basketHandler.addToBasket(sessId, data);
        let bestBasket = this.basketHandler.getBestBasket(sessId);
        this.basketHandler.showBasket(sessId);
        let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketAddRes, bestBasket);
        this.wss.sendToSession(sessId, message);
    }
    onMessOffersDone(sessId) {
        console.log("BasketWsApiController :: onMessOffersDone ::", sessId);
    }
    /**
     * Emit Search Message through Search Service
     * @param {string} code
     * @param {string} sessId
     */
    emitGetOffersMessage(code, sessId) {
        let messageData = { code: code };
        this.serviceClient.sendMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, sessId);
    }
    initRoutes(routes) { }
}
exports.BasketWsApiController = BasketWsApiController;
