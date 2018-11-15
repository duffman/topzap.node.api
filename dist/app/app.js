"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const miner_status_1 = require("@miner/miner-status");
//const express = require("express");
//let bodyParser = require("body-parser");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const database_manager_1 = require("@db/database-manager");
const logger_1 = require("@cli/logger");
const product_db_1 = require("../db/product-db");
const miner_api_1 = require("@api/miner-api");
const barcode_parser_1 = require("@zaplib/barcode-parser");
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
            this.productDb.getProductOffers(barcode, false, false).then((result) => {
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
        app.use(cookieParser());
        app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        app.get('/minerstats', function (req, res) {
            let stat = new miner_status_1.MinerStatus();
            stat.getProgressInfo().then((data) => {
                console.log(data);
                res.render('pages/minerstats', { progData: data });
            });
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
        app.post('/barcode', (req, res) => {
            // /:code
            let data = req.body;
            let reqCode = data.ean; //  req.params.code;
            let fullResult = !data.cache;
            let debug = data.debug;
            logger_1.Logger.logGreen("Given Barcode:", data);
            reqCode = barcode_parser_1.BarcodeParser.prepEan13Code(reqCode, true);
            logger_1.Logger.logGreen("Prepared Barcode:", reqCode);
            this.productDb.getProductOffers(reqCode, fullResult, extendedProdData, debug).then((result) => {
                if (result.product != null) {
                    logger_1.Logger.logGreen("Product found:", result.product.title);
                    res.json(result);
                }
                else {
                    res.json(new Error("Not found"));
                }
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
