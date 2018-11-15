"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ProductApi {
    constructor() { }
    init(expressApp) {
        let scope = this;
        //
        // Product Bid
        //
        expressApp.get("/bid/:barcode", (req, res) => {
            let barcode = req.params.barcode;
        });
        //
        // Product Bid
        //
        expressApp.post("/calcbasket/:barcode", (req, res) => {
            let fruits = req.body.items.split(",");
            console.log(fruits); // This is an array
        });
    }
}
exports.ProductApi = ProductApi;
