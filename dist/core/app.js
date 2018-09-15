"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = require("@Db/models/product-model");
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
const express = require("express");
class App {
    constructor() {
        this.port = 8976;
        this.expressApp = express();
        console.log("App started");
        this.init();
    }
    init() {
        let model = new product_model_1.ProductModel("Kalle", "0345034543", "http://www.kalle.com/d.jpg");
        this.expressApp.get('/api/offer', (req, res) => {
            res.json(model);
        });
        this.expressApp.listen(this.port);
        console.log(`Listening on localhost: ${this.port}`);
    }
}
exports.App = App;
let app = new App();
