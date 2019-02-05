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
     * @param {string} socketId
     */
    emitGetOffersMessage(code, socketId) {
        let scope = this;
        let messageData = {
            code: code
        };
        this.serviceClient.sendMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, socketId);
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    /*****
     *
     *  Emit Messages To User Session
     *
     */
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
    doGetOffers(code, socketId) {
        let scope = this;
        console.log("doGetOffers :: " + code + " :: " + socketId);
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
                scope.emitGetOffersInit(socketId, new get_offers_messages_1.GetOffersInit(cachedRes.length));
                for (const entry of cachedRes) {
                    scope.emitVendorOffer(socketId, entry);
                }
                scope.emitOffersDone(socketId);
                //
                // Lookup offers through the price service
                //
            }
            else {
                scope.emitGetOffersMessage(code, socketId); // Call price service
            }
        });
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
        try {
            if (this.debugMode) {
                cli_logger_1.Logger.logYellow("WSSERVER :: Message ::", mess.data);
                cli_logger_1.Logger.logYellow("WSSERVER :: Session ID ::", session.sessionId);
            }
            if (mess.id === zap_message_types_1.ZapMessageType.GetOffers) {
                let code = mess.data.code;
                if (this.debugMode)
                    cli_logger_1.Logger.logYellow("GET OFFERS :: CODE ::", code);
                this.doGetOffers(code, session.sessionId);
            }
        }
        catch (err) {
            cli_logger_1.Logger.logFatalError("onClientMessage");
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
    console.log("OUTSIDE CODE EXECUTING");
    let app = new SearchWsApiController();
    //app.doDebugSearch(null, null);
}
