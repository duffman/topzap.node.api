"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const phttp_client_1 = require("@putte/inet/phttp-client");
const cli_logger_1 = require("@cli/cli.logger");
class PriceSearchIntegration {
    getZap(reqUrl, barcode) {
        return new Promise((resolve, reject) => {
            phttp_client_1.PHttpClient.getHttp(reqUrl).then((res) => {
                cli_logger_1.Logger.logGreen("getMinerServerSession :: success ::", res);
                resolve(res);
            }).catch((err) => {
                cli_logger_1.Logger.logGreen("getMinerServerSession :: error ::", err);
                reject(err);
            });
        });
    }
}
exports.PriceSearchIntegration = PriceSearchIntegration;
