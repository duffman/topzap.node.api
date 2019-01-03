"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class VendorOfferResult {
    constructor(success = false, code = null, vendorId = -1, accepted = false, title = null, offer = null, rawData = null) {
        this.success = success;
        this.code = code;
        this.vendorId = vendorId;
        this.accepted = accepted;
        this.title = title;
        this.offer = offer;
        this.rawData = rawData;
    }
}
exports.VendorOfferResult = VendorOfferResult;
