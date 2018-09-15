"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ProductModel {
    constructor(name = "", barcode = "", cover_url = "") {
        this.name = name;
        this.barcode = barcode;
        this.cover_url = cover_url;
    }
}
exports.ProductModel = ProductModel;
