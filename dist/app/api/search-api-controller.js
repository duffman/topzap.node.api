"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const product_db_1 = require("@db/product-db");
const barcode_parser_1 = require("@zaplib/barcode-parser");
const controller_utils_1 = require("@api/controller.utils");
const price_search_service_1 = require("@core/price-search-engine/price.search-service");
const cli_commander_1 = require("@cli/cli.commander");
class SearchApiController {
    constructor() {
        this.productDb = new product_db_1.ProductDb();
        this.searchEngine = new price_search_service_1.PriceSearchService();
    }
    initRoutes(routes) {
        let scope = this;
        //
        // Get Product by Barcode
        //
        let extendedProdData = true;
        routes.post("/code2BLABLA", (req, resp) => {
            // /:code
            let data = req.body;
            let reqCode = data.ean; //  req.params.code;
            let fullResult = !data.cache;
            let debug = data.debug;
            cli_logger_1.Logger.logGreen("Given Barcode:", data);
            reqCode = barcode_parser_1.BarcodeParser.prepEan13Code(reqCode, true);
            cli_logger_1.Logger.logGreen("Prepared Barcode:", reqCode);
            this.productDb.getProductOffers(reqCode, fullResult, extendedProdData, debug).then((result) => {
                if (result.product != null) {
                    cli_logger_1.Logger.logGreen("Product found:", result.product.title);
                    resp.json(result);
                }
                else {
                    resp.json(new Error("Not found"));
                }
            }).catch((error) => {
                cli_logger_1.Logger.logError("Error in test", error);
            });
        });
        //
        // Get Zap Result by GET barcode
        //
        routes.get("/codes", (req, resp) => {
            console.log("Fet fucking GET CODE");
            let reqCode = req.params.code;
            scope.callSearchService(reqCode).then((searchRes) => {
                console.log("JOKER :: SEARCH RESULT ::", searchRes);
            }).catch((err) => {
                controller_utils_1.ControllerUtils.internalError(resp);
                cli_logger_1.Logger.logError("SearchApiController :: error ::", err);
            });
        });
        //
        // Get Zap Result by POST barcode
        //
        routes.post("/code", (req, resp) => {
            console.log("CODE FROM NR 1 ::", req.body.code);
            cli_logger_1.Logger.spit();
            cli_logger_1.Logger.spit();
            console.log("REQUEST BODY ::", req.body);
            cli_logger_1.Logger.spit();
            cli_logger_1.Logger.spit();
            let data = req.body;
            let reqCode = data.code;
            console.log("FUCK MY ASS ::: ", reqCode);
            let fullResult = !data.cache;
            let debug = data.debug;
            console.log("Given Barcode:", data);
            //reqCode = BarcodeParser.prepEan13Code(reqCode, true);
            cli_logger_1.Logger.logGreen("Prepared Barcode:", reqCode);
            scope.callSearchService(reqCode).then((searchRes) => {
                console.log("RIDDLER :: SEARCH RESULT ::", searchRes);
                resp.json(searchRes);
            }).catch((err) => {
                controller_utils_1.ControllerUtils.internalError(resp);
                cli_logger_1.Logger.logError("SearchApiController :: error ::", err);
            });
        });
        routes.get('/code/:code', this.doDebugSearch.bind(this));
    }
    doDebugSearch(req, resp) {
        console.log("SEARCH FUCKING DEBUG!!!");
        let code = "819338020068";
        return new Promise((resolve, reject) => {
            this.callSearchService(code).then((searchRes) => {
                console.log("BATMAN :: SEARCH RESULT ::", searchRes);
                resolve(searchRes);
            }).catch((err) => {
                controller_utils_1.ControllerUtils.internalError(resp);
                cli_logger_1.Logger.logError("SearchApiController :: error ::", err);
            });
        });
    }
    //	public callSearchService(code: string): Promise<SearchResult> {
    callSearchService(code) {
        cli_logger_1.Logger.logGreen("callSearchService");
        let url = zappy_app_settings_1.Settings.PriceServiceApi.Endpoint;
        return new Promise((resolve, reject) => {
            return this.searchEngine.doSearch(code).then((searchResult) => {
                console.log("callSearchService :: doSearch ::", searchResult);
                resolve(searchResult);
            }).catch((err) => {
                console.log("callSearchService :: error ::", err);
                resolve(err);
            });
        });
    }
}
exports.SearchApiController = SearchApiController;
if (cli_commander_1.CliCommander.debug()) {
    let app = new SearchApiController();
    app.doDebugSearch(null, null);
}
