"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Promise = require("bluebird");
const database_manager_1 = require("@db/database-manager");
const logger_1 = require("../logger");
const product_db_1 = require("@core/product-db");
const miner_server_1 = require("@miner/miner-server");
class App {
    constructor() {
        this.port = 8080;
        this.expressApp = express();
        this.db = new database_manager_1.DbManager();
        this.productDb = new product_db_1.ProductDb();
        this.minerServ = new miner_server_1.MinerServer();
        this.init();
    }
    test(barcode) {
        return new Promise((resolve, reject) => {
            this.productDb.getProductOffers(barcode, false).then((result) => {
                resolve(result);
            }).catch((error) => {
                logger_1.Logger.logError("Error in test", error);
            });
        });
    }
    /**
     * Initialize The Express Web Server
     */
    init() {
        let app = this.expressApp;
        var bodyParser = require('body-parser');
        //app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        // TODO: MOVE TO NGINX
        // Get Static file
        //
        app.use(express.static('public'));
        app.get('/res/:filename', (req, res) => {
            let filename = req.params.code;
            console.log("Get file", filename);
        });
        //
        // Get Product by Barcode
        //
        let extendedProdData = true;
        app.get('/barcode/:code', (req, res) => {
            let reqCode = req.params.code;
            logger_1.Logger.logGreen("Looking up Barcode:", reqCode);
            this.productDb.getProductOffers(reqCode, extendedProdData).then((result) => {
                if (result.product != null)
                    logger_1.Logger.logGreen("Product found:", result.product.title);
                res.json(result);
            }).catch((error) => {
                logger_1.Logger.logError("Error in test", error);
            });
        });
        //
        // Get Miner Session
        //
        this.minerServ.init(app);
        app.listen(this.port);
        console.log(`Listening on localhost: ${this.port}`);
    }
}
exports.App = App;
let app = new App();
/*
app.test("045496590451").then((result) => {
    console.log(JSON.stringify(result));
});
*/
