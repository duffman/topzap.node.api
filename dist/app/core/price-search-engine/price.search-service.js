"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const phttp_client_1 = require("@putte/inet/phttp-client");
const socket_io_client_1 = require("@igniter/coldmind/socket-io.client");
const message_types_1 = require("@igniter/messaging/message-types");
const zap_message_types_1 = require("@zapModels/zap-message-types");
class PriceSearchService {
    constructor() {
        this.serviceClient = new socket_io_client_1.IgniterClientSocket();
        this.serviceClient.connect();
        this.serviceClient.onMessage((message) => {
            console.log("New Message ::", message);
        });
    }
    doPriceSearch(code, sessId = null) {
        let messageData = {
            code: code
        };
        return this.serviceClient.sendAwaitMessage(message_types_1.MessageType.Action, zap_message_types_1.ZapMessageType.GetOffers, messageData, sessId);
    }
    doSearch(code) {
        let url = zappy_app_settings_1.Settings.PriceServiceApi.Endpoint + "/" + code;
        return new Promise((resolve, reject) => {
            phttp_client_1.PHttpClient.getHttp(url).then((res) => {
                cli_logger_1.Logger.logGreen("PriceSearchService :: doSearch :: success ::", res);
                resolve(res);
            }).catch((err) => {
                cli_logger_1.Logger.logGreen("PriceSearchService :: doSearch :: error ::", err);
                reject(err);
            });
        });
    }
}
exports.PriceSearchService = PriceSearchService;
