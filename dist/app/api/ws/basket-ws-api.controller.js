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
const pstr_utils_1 = require("@putte/pstr-utils");
const remove_item_result_1 = require("@zapModels/basket/remove-item-result");
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
    onClientMessage(mess, session) {
        let sessId = mess.socket.request.sessionID;
        if (mess.id === zap_message_types_1.ZapMessageType.BasketPull) {
            this.onBasketPull(sessId, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketGet) {
            this.onBasketGet(sessId, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketRem) {
            this.onBasketRem(sessId, mess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.BasketAdd) {
            this.onBasketAdd(sessId, mess);
        }
    }
    emitGetOffersInit(sessId, data) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersInit, data, sessId);
        this.wss.sendToSessionId(sessId, mess);
    }
    emitVendorOffer(sessId, data) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.VendorOffer, data, sessId);
        this.wss.sendToSessionId(sessId, mess);
    }
    emitOffersDone(sessId) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersDone, {}, sessId);
        this.wss.sendToSessionId(sessId, mess);
    }
    /**
     * Attempt to get cached offers
     * @param {string} code
     * @param {string} sessId
     * @param {boolean} fallbalOnSearch
     */
    getCachedOffers(code, sessId, fallbalOnSearch = true) {
        let scope = this;
        console.log("doGetOffers :: " + code + " :: " + sessId);
        this.cachedOffersDb.getCachedOffers(code).then(res => {
            return res;
        }).catch(err => {
            console.log("BasketWsApiController :: doGetOffers :: Catch ::", err);
            return null;
        }).then((cachedRes) => {
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
            else if (fallbalOnSearch) {
                scope.emitGetOffersMessage(code, sessId); // Call price service
            }
        });
    }
    doGetOffers(sessId, mess) {
        let code = mess.data.code;
        if (!pstr_utils_1.PStrUtils.isNumeric(code)) {
            cli_logger_1.Logger.logDebugErr("BasketWsApiController :: doGetOffers ::", code);
            this.wss.sendError(sessId, zap_message_types_1.ZapMessageType.ErrInvalidCode, {}, mess.tag);
            return;
        }
        if (zappy_app_settings_1.Settings.Caching.UseCachedOffers) {
            this.getCachedOffers(code, sessId);
        }
        else {
            this.emitGetOffersMessage(code, sessId); // Call price service
        }
    }
    onBasketAdd(sessId, mess) {
        this.doGetOffers(sessId, mess);
        //this.emitGetOffersMessage(mess.data.code, sessId);
        mess.ack();
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onBasketGet(sessId, mess) {
        /*console.log("onBasketGet");
        let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
        mess.replyTyped(ZapMessageType.BasketGet, bestBasket);
        */
        console.log("onBasketGet");
        let bestBasket = this.basketHandler.getBestBasket(sessId);
        console.log("onBasketGet :: bestBasket");
        let messReply = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketGet, bestBasket);
        this.wss.sendToSessionId(sessId, messReply);
    }
    onBasketRem(sessId, mess) {
        let code = mess.data.code;
        let res = this.basketHandler.removeItemByCode(sessId, code);
        cli_logger_1.Logger.logYellow("REMOVE FROM BASKET :: CODE ::", code);
        mess.replyTyped(zap_message_types_1.ZapMessageType.BasketRemRes, new remove_item_result_1.BasketRemItemRes(res, code));
    }
    /**
     * Retrieves
     * @param {string} sessId
     * @param {IZynMessage} mess
     */
    onBasketPull(session, mess) {
        let scope = this;
        let attachVendors = mess.data.attachVendors;
        this.basketHandler.getExtSessionBasket(sessId).then(result => {
            //mess.replyTyped(ZapMessageType.BasketPull, result);
            return result;
        }).then(res => {
            /*
            scope.productDb.getVendors().then(data => {

            }).catch(err => {
                Logger.logDebugErr("onBasketPull :: getVendors() ::", err);
            });
            */
            console.log(" ");
            console.log(" ");
            console.log(" ");
            console.log("*** onBasketPull (BEFORE) :: message ::", res);
            console.log(" ");
            let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketPull, res);
            console.log("*** onBasketPull (AFTER) :: message ::", message.data);
            console.log(" ");
            console.log("*** onBasketPull :: message ::", message);
            console.log(" ");
            console.log(" ");
            console.log(" ");
            for (let vb of res.data) {
                console.log("*** VENDOR DATA ::", vb);
            }
            this.wss.sendToSessionId(sessId, message);
        }).catch(err => {
            mess.error(err);
        });
        /*		this.basketHandler.getExtSessionBasket(sessId).then(result => {
                    //mess.replyTyped(ZapMessageType.BasketPull, result);
                    let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketPull, result);
                    this.wss.sendToSessionId(sessId, message);
                }).catch(err => {
                    mess.error(err);
                });
        */
    }
    onMessOffersInit(session) {
        console.log("BasketWsApiController :: onMessOffersInit ::", session.id);
    }
    onMessVendorOffer(socketId, data) {
        this.wss.findSocket(socketId);
        console.log("BasketWsApiController :: onMessVendorOffer :: " + socketId + " ::", data);
        this.basketHandler.addToBasket(session, data);
        let bestBasket = this.basketHandler.getBestBasket(session);
        this.basketHandler.showBasket(session);
        let message = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.BasketAddRes, bestBasket);
        this.wss.sendToSessionId(me, message);
    }
    onMessOffersDone(sessId) {
        console.log("BasketWsApiController :: onMessOffersDone ::", sessId);
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
