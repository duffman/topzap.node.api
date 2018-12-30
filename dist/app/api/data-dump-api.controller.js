"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class DataDumpApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }
    doDataDump(req, resp) {
    }
    attachWSS(wss) {
    }
    initRoutes(routes) {
        routes.post('/dump', this.doDataDump.bind(this));
    }
}
exports.DataDumpApiController = DataDumpApiController;
