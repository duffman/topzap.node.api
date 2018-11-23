"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const cli_logger_1 = require("@cli/cli.logger");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const phttp_client_1 = require("@putte/inet/phttp-client");
class PriceSearchService {
    constructor() { }
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
    doSearch2(code, useProxy = false) {
        let payload = {
            code: code,
            ext: false
        };
        // "http://localhost:6562"
        let options = {
            uri: zappy_app_settings_1.Settings.PriceServiceApi.Endpoint,
            headers: {
                'User-Agent': 'zapStorm/36.3',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        };
        let scope = this;
        return new Promise((resolve, reject) => {
            return request.post(options, { payload }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    cli_logger_1.Logger.logGreen("Success", body);
                    resolve(body);
                }
                else {
                    cli_logger_1.Logger.logError("PostRequest :: Error", error);
                    reject(error);
                }
            });
        });
    }
}
exports.PriceSearchService = PriceSearchService;
