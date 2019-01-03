"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class BasketItem {
    constructor(zid, code, vendorId, title, offer, count = 1) {
        this.zid = zid;
        this.code = code;
        this.vendorId = vendorId;
        this.title = title;
        this.offer = offer;
        this.count = count;
    }
}
exports.BasketItem = BasketItem;
