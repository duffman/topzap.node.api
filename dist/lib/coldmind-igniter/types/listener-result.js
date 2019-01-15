"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * December 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SrvListenResult {
    constructor(success = false, portNumber = -1, addressInfo = null, error = null) {
        this.success = success;
        this.portNumber = portNumber;
        this.addressInfo = addressInfo;
        this.error = error;
    }
}
exports.SrvListenResult = SrvListenResult;
