"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    static _baseLog(prefix, message, data = null) {
        if (data) {
            console.log(`${prefix} :: ${message} ::`, data);
        }
        else {
            console.log(`${prefix}  :: ${message}`);
        }
    }
    static debug(message, data = null) {
        Log._baseLog("DBG", message, data);
    }
    static info(message, data = "") {
        if (data && data.length > 0) {
            console.log(`INFO :: ${message} ::`, data);
        }
        else {
            console.log(`INFO :: ${message}`);
        }
    }
    static data(message, data = null) {
        if (data !== null) {
            console.log(`DATA :: ${message} ::`, data);
        }
        else {
            console.log(`DATA :: ${message}`);
        }
    }
    static error(message, err = null) {
        if (err !== null) {
            console.log(`ERR :: ${message} ::`, err);
        }
        else {
            console.log(`ERR :: ${message}`);
        }
    }
}
exports.Log = Log;
