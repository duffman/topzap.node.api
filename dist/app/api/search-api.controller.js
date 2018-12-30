"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const controller_utils_1 = require("@api/controller.utils");
const price_search_service_1 = require("@core/price-search-engine/price.search-service");
const cli_commander_1 = require("@cli/cli.commander");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const zap_message_types_1 = require("@zapModels/zap-message-types");
const message_types_1 = require("@igniter/messaging/message-types");
const socket_io_client_1 = require("@igniter/coldmind/socket-io.client");
const cached_offers_db_1 = require("@db/cached-offers-db");
class SearchApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.searchService = new price_search_service_1.PriceSearchService();
        this.serviceClient = new socket_io_client_1.IgniterClientSocket();
        this.serviceClient.connect();
        this.cachedOffersDb = new cached_offers_db_1.CachedOffersDb();
    }
    emitGetOffersMessage(code, sessId) {
        let scope = this;
        let messageData = {
            code: code
        };
        this.serviceClient.sendMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, sessId);
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onServiceMessage(mess) {
        let scope = this;
        mess.socket = null;
        console.log("this.serviceClient.onMessage :: data ::", mess);
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersInit) {
            scope.emitGetOffersInit(mess.tag, mess.data);
            //let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
            //scope.wss.sendToSession(mess.tag, replyMess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.VendorOffer) {
            scope.emitVendorOffer(mess.tag, mess.data);
            //let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
            //scope.wss.sendToSession(mess.tag, replyMess);
        }
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffersDone) {
            scope.emitOffersDone(mess.tag, mess.data);
            //let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
            //scope.wss.sendToSession(mess.tag, replyMess);
        }
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
    emitOffersDone(sessId, data) {
        let mess = new igniter_messages_1.IgniterMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffersDone, data, sessId);
        this.wss.sendToSession(sessId, mess);
    }
    attachWSS(wss) {
        this.wss = wss;
        this.wss.onMessage(this.onUserMessage.bind(this));
    }
    onUserMessage(mess) {
        let scope = this;
        let sessId = mess.socket.request.sessionID;
        console.log("WSSERVER :: Message ::", mess.data);
        console.log("WSSERVER :: Session ID ::", sessId);
        if (mess.id === zap_message_types_1.ZapMessageType.GetOffers) {
            let code = mess.data.code;
            console.log("GET OFFERS :: CODE ::", code);
            this.doGetOffers(code, sessId);
            mess.ack();
        }
    }
    doGetOffers(code, sessId) {
        console.log("doGetOffers :: " + code + " :: " + sessId);
        this.cachedOffersDb.getCachedOffers(code).then(res => {
            return res;
        }).catch(err => {
            console.log("doGetOffers :: Catch ::", err);
            return null;
        }).then(cachedRes => {
            console.log("Final THEN ::", cachedRes);
            if (cachedRes) {
                for (const entry of cachedRes) {
                }
            }
            this.emitGetOffersMessage(code, sessId); // Call price service
        });
    }
    initRoutes(routes) {
        let scope = this;
        routes.get("/pt/:code", (req, resp) => {
            let code = req.params.code;
            console.log("Test Test ::", code);
            scope.searchService.doPriceSearch(code).then(res => {
                console.log("doPriceSearch -> resolved");
                resp.json(res);
            }).catch(err => {
                resp.json(new Error("Error looking up price!"));
            });
        });
        //
        // Get Product by Barcode
        //
        let extendedProdData = true;
        //
        // Get Zap Result by POST barcode
        //
        routes.post("/code", (req, resp) => {
            console.log("CODE FROM NR 1 ::", req.body.code);
            cli_logger_1.Logger.spit();
            cli_logger_1.Logger.spit();
            console.log("REQUEST BODY ::", req.body);
            cli_logger_1.Logger.spit();
            cli_logger_1.Logger.spit();
            let data = req.body;
            let reqCode = data.code;
            let fullResult = !data.cache;
            let debug = data.debug;
            console.log("Given Barcode:", data);
            //reqCode = BarcodeParser.prepEan13Code(reqCode, true);
            cli_logger_1.Logger.logGreen("Prepared Barcode:", reqCode);
            scope.callSearchService(reqCode).then((searchRes) => {
                resp.setHeader('Content-Type', 'application/json');
                resp.send(searchRes);
                //this.reqSession = req.session;
                //let addResult = this.basketController.addToBasket(reqCode, searchRes);
                //resp.send(searchRes);
                /*/resp.json(addResult);
                resp.json({test: "kalle"});
                */
            }).catch((err) => {
                controller_utils_1.ApiControllerUtils.internalError(resp);
                cli_logger_1.Logger.logError("SearchApiController :: error ::", err);
            });
        });
    }
    callSearchService(code) {
        cli_logger_1.Logger.logGreen("callSearchService");
        let url = zappy_app_settings_1.Settings.PriceServiceApi.Endpoint;
        return new Promise((resolve, reject) => {
            return this.searchService.doPriceSearch(code).then((searchResult) => {
                console.log("callSearchService :: doSearch ::", searchResult);
                // let result = ZapOfferResult.toZapRes(searchResult);
                resolve(null);
            }).catch((err) => {
                console.log("callSearchService :: error ::", err);
                resolve(err);
            });
        });
    }
}
exports.SearchApiController = SearchApiController;
if (cli_commander_1.CliCommander.debug()) {
    let app = new SearchApiController();
    //app.doDebugSearch(null, null);
}
