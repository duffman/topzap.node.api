"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ProductBidModel {
    constructor(id, vendorId, productId, barcode, buy_price, sell_price) {
        this.id = id;
        this.vendorId = vendorId;
        this.productId = productId;
        this.barcode = barcode;
        this.buy_price = buy_price;
        this.sell_price = sell_price;
    }
}
exports.ProductBidModel = ProductBidModel;
