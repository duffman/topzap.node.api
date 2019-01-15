"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const product_db_1 = require("@db/product-db");
class DbApiController {
    attachWSS(wss) {
    }
    initRoutes(routes) {
        this.productDb = new product_db_1.ProductDb();
    }
}
exports.DbApiController = DbApiController;
