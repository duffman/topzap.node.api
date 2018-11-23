"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const miner_status_1 = require("@miner/miner-status");
const express = require("express");
const express_1 = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const database_manager_1 = require("@putteDb/database-manager");
const cli_logger_1 = require("@cli/cli.logger");
const miner_api_controller_1 = require("@api/miner-api-controller");
const product_db_1 = require("@db/product-db");
const service_api_controller_1 = require("@api/service-api-controller");
const cli_commander_1 = require("@cli/cli.commander");
const search_api_controller_1 = require("@api/search-api-controller");
class ZapApp {
    constructor(includeMinerApi = false) {
        this.includeMinerApi = includeMinerApi;
        this.port = 8080;
        this.webRoutes = express_1.Router();
        this.apiControllers = new Array();
        this.webApp = express();
        this.webApp.use(this.webRoutes);
        this.db = new database_manager_1.DbManager();
        this.productDb = new product_db_1.ProductDb();
        console.log(" ");
        console.log(" ");
        console.log(">> webApp.routes", this.webApp.routes);
        console.log(">> TYPE :: webApp.routes", typeof this.webApp.routes);
        console.log(" ");
        console.log(">> webRoutes", this.webRoutes);
        console.log(">>TYPE :: webRoutes.routes", typeof this.webRoutes);
        console.log(" ");
        console.log(" ");
        this.init();
    }
    getVersion() {
        return "ZapApp-Node-API/1.6.5";
    }
    //
    // This is really bad design, but until we have DI, this OK for now,,,
    //
    test(barcode) {
        return new Promise((resolve, reject) => {
            this.productDb.getProductOffers(barcode, false, false).then((result) => {
                resolve(result);
            }).catch((error) => {
                cli_logger_1.Logger.logError("Error in test", error);
            });
        });
    }
    /**
     * Create child controllers and let each controlller
     * add itself to the main Router
     */
    initControllers() {
        const routes = this.webRoutes;
        const controllers = this.apiControllers;
        controllers.push(new search_api_controller_1.SearchApiController());
        controllers.push(new service_api_controller_1.ServiceApiController());
        controllers.push(new miner_api_controller_1.MinerApiController());
        //
        // Pass the Route object to each controller to assign routes
        //
        for (let index in controllers) {
            let controller = controllers[index];
            controller.initRoutes(routes);
        }
    }
    configureWebServer() {
        let app = this.webApp;
        // set the view engine to ejs
        app.set('view engine', 'ejs');
        this.webRoutes.use(cookieParser());
        this.webRoutes.use(bodyParser.json()); // support json encoded bodies
        this.webRoutes.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.webRoutes.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    }
    /**
     * Initialize The Express Web Server
     */
    init() {
        const routes = this.webRoutes;
        this.configureWebServer();
        this.initControllers();
        routes.get('/minerstats', function (req, res) {
            let stat = new miner_status_1.MinerStatus();
            stat.getProgressInfo().then((data) => {
                console.log(data);
                res.render('pages/minerstats', { progData: data });
            });
        });
        // TODO: MOVE TO NGINX
        // Get Static file
        //
        this.webApp.use(express.static('public'));
        this.webApp.get('/res/:filename', (req, res) => {
            let filename = req.params.code;
            console.log("Get file", filename);
        });
        this.webApp.listen(this.port);
        console.log(`Listening on localhost: ${this.port}`);
    }
}
exports.ZapApp = ZapApp;
if (cli_commander_1.CliCommander.debug()) {
    let minerApi = true;
    let app = new ZapApp(minerApi);
}
