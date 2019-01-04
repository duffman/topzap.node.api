"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const cli_commander_1 = require("@cli/cli.commander");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
const message_types_1 = require("@igniter/messaging/message-types");
const cached_offers_db_1 = require("@db/cached-offers-db");
const get_offers_messages_1 = require("@zapModels/messages/get-offers-messages");
class SearchWsApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.cachedOffersDb = new cached_offers_db_1.CachedOffersDb();
    }
    initRoutes(routes) {
    }
    /**
     * Emit Search Message through Search Service
     * @param {string} code
     * @param {string} sessId
     */
    emitGetOffersMessage(code, sessId) {
        let scope = this;
        let messageData = {
            code: code
        };
        this.serviceClient.sendMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, sessId);
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    /*****
     *
     *  Emit Messages To User Session
     *
     */
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
                    scope.emitVendorOffer(sessId, entry);
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
    attachWSS(wss) {
        this.wss = wss;
        this.wss.onMessage(this.onUserMessage.bind(this));
    }
    /**
     * New Message from a User Session/Device
     * @param {IMessage} mess
     */
    onUserMessage(mess) {
        let scope = this;
        let sessId = mess.socket.request.sessionID;
        if (this.debugMode) {
            cli_logger_1.Logger.logYellow("WSSERVER :: Message ::", mess.data);
            cli_logger_1.Logger.logYellow("WSSERVER :: Session ID ::", sessId);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffers) {
            let code = mess.data.code;
            if (this.debugMode)
                cli_logger_1.Logger.logYellow("GET OFFERS :: CODE ::", code);
            this.doGetOffers(code, sessId);
            mess.ack();
        }
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    /**
     * New Message from Search Service
     * @param {IMessage} mess
     */
    onServiceMessage(mess) {
        let scope = this;
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersInit) {
            scope.emitGetOffersInit(mess.tag, mess.data);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.VendorOffer) {
            scope.emitVendorOffer(mess.tag, mess.data);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersDone) {
            scope.emitOffersDone(mess.tag);
        }
    }
}
exports.SearchWsApiController = SearchWsApiController;
if (cli_commander_1.CliCommander.debug()) {
    let app = new SearchWsApiController();
    //app.doDebugSearch(null, null);
}
