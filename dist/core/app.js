"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
const miner_status_1 = require("@miner/miner-status");
const express = require("express");
const Promise = require("bluebird");
const database_manager_1 = require("@db/database-manager");
const logger_1 = require("../logger");
const product_db_1 = require("@core/../product-api/product-db");
const miner_api_1 = require("@miner/miner-api");
let bodyParser = require("body-parser");
class App {
    constructor(minerApi = false) {
        this.minerApi = minerApi;
        this.port = 8080;
        this.expressApp = express();
        this.db = new database_manager_1.DbManager();
        this.productDb = new product_db_1.ProductDb();
        this.minerServ = new miner_api_1.MinerServerApi();
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
        // set the view engine to ejs
        app.set('view engine', 'ejs');
        //app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        app.get('/minerstats', function (req, res) {
            let stat = new miner_status_1.MinerStatus();
            stat.getProgressInfo();
            res.render('pages/minerstats', { data: "Kalle Kula" });
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
        // Miner Api Endpoint
        //
        if (this.minerApi) {
            this.minerServ.init(app);
        }
        app.listen(this.port);
        console.log(`Listening on localhost: ${this.port}`);
    }
}
exports.App = App;
let minerApi = true;
let app = new App(minerApi);
/*
app.test("045496590451").then((result) => {
    console.log(JSON.stringify(result));
});
*/
