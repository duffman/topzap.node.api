"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_db_1 = require("@db/analytics-db");
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
const cli_logger_1 = require("@cli/cli.logger");
class AnalyticsWsApiController {
    constructor(debugMode) {
        this.debugMode = debugMode;
        this.analyticsDb = new analytics_db_1.AnalyticsDb();
        console.log("********* AnalyticsWsApiController");
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
        this.wss.onMessage((mess) => {
            let sessId = mess.socket.request.sessionID;
            if (mess.id === zap_message_types_1.ZapMessageType.BasketAdd) {
                console.log("********* AnalyticsWsApiController :: ZapMessageType.BasketAdd");
                this.onBasketAdd(sessId, mess);
            }
        });
    }
    /**
     * Intercept the basket add message to add new zap
     * @param {string} sessId
     * @param {IZynMessage} mess
     */
    onBasketAdd(sessId, mess) {
        cli_logger_1.Logger.logGreen("AnalyticsWsApiController :: onBasketAdd");
        let code = mess.data.code;
        this.analyticsDb.doZap(code).then(res => {
            cli_logger_1.Logger.logGreen("AnalyticsWsApiController :: onBasketAdd :: doZap ::", res);
        }).catch(err => {
            cli_logger_1.Logger.logGreen("AnalyticsWsApiController :: onBasketAdd :: err ::", err);
        });
    }
    initRoutes(routes) { }
}
exports.AnalyticsWsApiController = AnalyticsWsApiController;
