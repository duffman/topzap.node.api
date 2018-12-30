"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class IGatlingMessage {
}
exports.IGatlingMessage = IGatlingMessage;
class GatlingMessage {
    constructor(host, port, data = null) {
        this.host = host;
        this.port = port;
        this.data = data;
        if (data === null) {
            data = "";
        }
        else {
            data = JSON.stringify(data);
        }
    }
    ;
}
exports.GatlingMessage = GatlingMessage;
