"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const server_api_1 = require("@core/server-api");
class ProductApi extends server_api_1.ServerApi {
    constructor() {
        super();
    }
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
            var fruits = req.body.items.split(",");
            console.log(fruits); // This is an array
        });
    }
}
exports.ProductApi = ProductApi;
