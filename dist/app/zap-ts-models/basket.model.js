"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
class BasketModel {
    constructor() {
        this.items = new Array();
    }
}
exports.BasketModel = BasketModel;
class VendorBasketModel extends BasketModel {
    constructor(vendorId) {
        super();
        this.vendorId = vendorId;
    }
}
exports.VendorBasketModel = VendorBasketModel;
