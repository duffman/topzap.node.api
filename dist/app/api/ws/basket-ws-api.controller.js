"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
const message_types_1 = require("@igniter/messaging/message-types");
const basket_handler_1 = require("@components/basket/basket.handler");
const session_manager_1 = require("@components/session-manager");
const message_factory_1 = require("@igniter/messaging/message-factory");
const product_db_1 = require("@db/product-db");
const get_offers_messages_1 = require("@zapModels/messages/get-offers-messages");
const cached_offers_db_1 = require("@db/cached-offers-db");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const remove_item_result_1 = require("@zapModels/basket/remove-item-result");
const session_keys_1 = require("@app/types/session-keys");
function FatLine(mess = "") {
    console.log(" ");
    console.log("===================================================");
    console.log(" ");
}
exports.FatLine = FatLine;
function LogFat(mess) {
    console.log(" ");
    console.log("=============== " + mess + " ====================");
    console.log(" ");
}
exports.LogFat = LogFat;
class BasketWsApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.productDb = new product_db_1.ProductDb();
        this.sessManager = new session_manager_1.SessionManager();
        this.basketHandler = new basket_handler_1.BasketHandler();
        this.cachedOffersDb = new cached_offers_db_1.CachedOffersDb();
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
        if (mess.id === zap_message_types_1.ZapMessageType.BasketPull) {
            this.onBasketPull(session, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketGet) {
            this.onBasketGet(session, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketRem) {
            this.onBasketRem(session, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketAdd) {
            this.onBasketAdd(session, mess);
        }
    }
    //
    emitGetOffersInit(socketId, data) {
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersInit, data, socketId);
        this.wss.sendMessageToSocket(socketId, mess);
    }
    emitVendorOffer(socketId, data) {
        cli_logger_1.Logger.logYellow("¤¤¤¤ emitVendorOffer");
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorOffer, data, socketId);
        cli_logger_1.Logger.logYellow("¤¤¤¤ emitVendorOffer :: mess ::", mess);
        this.wss.sendMessageToSocket(socketId, mess);
    }
    emitOffersDone(socketId) {
        let mess = new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersDone, {}, socketId);
        this.wss.sendMessageToSocket(socketId, mess);
    }
    getSessionBasket(session) {
        let attempt1 = session.get(session_keys_1.SessionKeys.Basket);
        let attempt2 = session.getAs(session_keys_1.SessionKeys.Basket);
        let attempt3 = session.get(session_keys_1.SessionKeys.Basket);
        /*
        LogFat("Session Basket Get");

        if (attempt1) {
            FatLine();
            console.log("ATTEMPT 1", attempt1);
        }
        if (attempt2) {
            FatLine();
            console.log("ATTEMPT 2", attempt2);
        }
        if (attempt3) {
            FatLine();
            console.log("ATTEMPT 3 ", attempt3);
        }
        */
        return null;
    }
    getCachedOfferData(code) {
        return new Promise((resolve, reject) => {
        });
    }
    /**
     * Attempt to getAs cached offers
     * @param {string} code
     * @param {string} sessId
     * @param {boolean} fallbalOnSearch
     */
    getCachedOffers(code, sessId, fallbalOnSearch = true) {
        let scope = this;
        console.log("########### doGetOffers :: " + code + " :: " + sessId);
        this.cachedOffersDb.getCachedOffers(code).then(res => {
            return res;
        }).catch(err => {
            cli_logger_1.Logger.logFatalError("BasketWsApiController :: doGetOffers :: Catch ::", err);
            return null;
        }).then((cachedRes) => {
            //
            // Simulate Messages Sent using a regular lookup
            //
            if (cachedRes && cachedRes.length > 0) {
                console.log("########### doGetOffers :: cachedRes");
                scope.emitGetOffersInit(sessId, new get_offers_messages_1.GetOffersInit(cachedRes.length));
                console.log("########### doGetOffers :: after : emitGetOffersInit");
                for (const entry of cachedRes) {
                    scope.onMessVendorOffer(sessId, entry);
                    //scope.emitVendorOffer(sessId, entry);
                }
                scope.emitOffersDone(sessId);
                //
                // Lookup offers through the price service
                //
            }
            else if (fallbalOnSearch) {
                scope.emitGetOffersMessage(code, sessId); // Call price service
            }
        });
    }
    doGetOffers(session, mess) {
        console.log("###################### ALLAN ################################");
        let code = mess.data.code;
        console.log("### doGetOffers ::", code);
        /*if (!PStrUtils.isNumeric(code)) {
            Logger.logDebugErr("BasketWsApiController :: doGetOffers ::", code);
            this.wss.messError(session.id, mess, new Error("messZapMessageType.ErrInvalidCode"));
            return;
        }*/
        if (zappy_app_settings_1.Settings.Caching.UseCachedOffers) {
            console.log("### doGetOffers ::", "UseCachedOffers");
            this.getCachedOffers(code, session.id);
        }
        else {
            console.log("### doGetOffers ::", "SEARCH SERVICE");
            this.emitGetOffersMessage(code, session.id); // Call price service
        }
    }
    // 08 123 40 000
    /**
     * Basket Add Handler
     * @param {IZynSession} session
     * @param {IZynMessage} mess
     */
    onBasketAdd(session, mess) {
        let basket = this.getSessionBasket(session);
        console.log(">>>>> onBasketGet", basket);
        if (!basket) {
            console.log(">>>>> handleMessage ::", "Clearing Session");
            //session.clear(); // <-- WATCH OUT for this bug, if clearing the session only one item at a time will be visible
        }
        console.log("### onBasketAdd");
        this.doGetOffers(session, mess);
        //this.emitGetOffersMessage(mess.data.code, sessId);
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onBasketGet(session, mess) {
        /*console.log("onBasketGet");
        let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
        mess.replyTyped(ZapMessageType.BasketGet, bestBasket);
        */
        console.log("onBasketGet");
        let bestBasket = this.basketHandler.getBestBasket(session);
        console.log("onBasketGet :: bestBasket");
        // WHY?
        let zynMessage = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketGet, bestBasket);
        this.wss.sendMessageToSocket(session.id, zynMessage);
    }
    /**
     * Remove item from session baset and re-save
     * @param {IZynSession} session
     * @param {IZynMessage} mess
     */
    onBasketRem(session, mess) {
        let code = mess.data.code;
        let basket = session.getAs(session_keys_1.SessionKeys.Basket);
        let res = this.basketHandler.removeItemByCode(code, basket);
        session.set(session_keys_1.SessionKeys.Basket, basket);
        cli_logger_1.Logger.logYellow("REMOVE FROM BASKET :: CODE ::", code);
        let zynMessage = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketRemRes, new remove_item_result_1.BasketRemItemRes(res, code));
        this.wss.sendMessageToSocket(session.id, zynMessage);
    }
    /**
     * Retrieves
     * @param {string} sessId
     * @param {IZynMessage} mess
     */
    onBasketPull(session, mess) {
        let scope = this;
        let attachVendors = mess.data.attachVendors;
        this.basketHandler.getExtSessionBasket(session).then(result => {
            return result;
        }).then(res => {
            console.log(" ");
            console.log("*** onBasketPull (BEFORE) :: message ::", res);
            console.log(" ");
            let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketPull, res);
            console.log("*** onBasketPull (AFTER) :: message ::", message.data);
            console.log(" ");
            console.log("*** onBasketPull :: message ::", message);
            console.log(" ");
            for (let vb of res.data) {
                console.log("*** VENDOR DATA ::", vb);
            }
            this.wss.sendMessageToSocket(session.id, message);
        }).catch(err => {
            this.wss.messError(session.id, mess, new Error("Error Pulling Basket"));
        });
    }
    onMessOffersInit(sessId) {
        console.log("BasketWsApiController :: onMessOffersInit ::", sessId);
    }
    /**
     * Vendor offer have been returned from the search service, now we
     * need to route it back to the requesting client...
     * @param {string} socketId
     * @param data
     */
    onMessVendorOffer(socketId, data) {
        //basket = this.getSessionBasket(socketId);
        //session.setValue(SessionKeys.Basket, basket);
        let session = this.wss.getSessionBySocketId(socketId);
        //console.log("getSessionBySocketId :: session ::", session.);
        console.log("BasketWsApiController :: onMessVendorOffer :: " + socketId + " ::", data);
        this.basketHandler.addToBasket(session, data);
        let bestBasket = this.basketHandler.getBestBasket(session);
        this.basketHandler.showBasket(session);
        let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketAddRes, bestBasket);
        this.wss.sendMessageToSocket(socketId, message);
    }
    onMessOffersDone(socketId) {
        console.log("BasketWsApiController :: onMessOffersDone ::", socketId);
    }
    /**
     * Message from one of the Price Services
     * @param {IZynMessage} mess
     */
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
