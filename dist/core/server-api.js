"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ServerApi {
    internalError(res, message = "") {
        res.writeHead(501, { 'Content-Type': 'text/plain' });
        res.end(message);
    }
}
exports.ServerApi = ServerApi;
