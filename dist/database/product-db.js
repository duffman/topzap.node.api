"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@putteDb/database-manager");
const cli_logger_1 = require("@cli/cli.logger");
const vendor_model_1 = require("@models/vendor-model");
const product_bid_model_1 = require("@models/product-bid-model");
const search_result_1 = require("@models/search-result");
const platform_type_parser_1 = require("@utils/platform-type-parser");
const pstr_utils_1 = require("@putte/pstr-utils");
const cli_commander_1 = require("@cli/cli.commander");
const product_model_1 = require("@zapModels/product.model");
class ProductDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
        this.init();
    }
    init() { }
    //
    // Get Product
    // - extended adds pltform image info
    //
    getProduct(barcode, extended = true, debug = false) {
        function generateSql() {
            if (!debug) {
                return `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`;
            }
            else {
                return `SELECT games.* FROM games, product_edition AS edition WHERE games.id = edition.game_id ORDER BY RAND() LIMIT 1`;
            }
        }
        let sql = generateSql();
        cli_logger_1.Logger.logGreen("SQL ::", sql);
        function createProductModel(dbRow) {
            if (dbRow.isEmpty) {
                return new product_model_1.ProductData();
            }
            else {
                return new product_model_1.ProductData(dbRow.getValAsInt("id"), barcode, dbRow.getValAsStr("platform_name"), dbRow.getValAsStr("title"), dbRow.getValAsStr("publisher"), dbRow.getValAsStr("developer"), dbRow.getValAsStr("genre"), dbRow.getValAsStr("cover_image"), dbRow.getValAsStr("thumb_image"), dbRow.getValAsStr("video_source"), dbRow.getValAsStr("source"), dbRow.getValAsStr("release_date"));
            }
        }
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let dbRow = dbRes.safeGetFirstRow();
                let model = createProductModel(dbRow);
                let havePlatformAndTitle = !pstr_utils_1.PStrUtils.isEmpty(model.platformName) && !pstr_utils_1.PStrUtils.isEmpty(model.title);
                //
                // Add extended properties
                //
                if (extended && !dbRow.isEmpty && havePlatformAndTitle) {
                    cli_logger_1.Logger.logYellow("Adding extended properties to:", model.title);
                    let gpp = new platform_type_parser_1.PlatformTypeParser();
                    model.platformIcon = gpp.parseFromName(model.title, true);
                    model.platformImage = gpp.parseFromName(model.platformName, false);
                    cli_logger_1.Logger.logCyan("getProduct() :: Model", model);
                }
                resolve(model);
            }).catch((error) => {
                cli_logger_1.Logger.logError("getProduct() :: error ::", error);
                reject(error);
            });
        });
    }
    //
    // Get Full Vendor List
    //
    getVendors() {
        let result = new Array();
        let sql = `SELECT * FROM product_vendors`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                for (let i = 0; i < dbRes.result.rowCount(); i++) {
                    let dbRow = dbRes.result.dataRows[i];
                    let model = new vendor_model_1.VendorModel(dbRow.getValAsStr("id"), dbRow.getValAsStr("identifier"), dbRow.getValAsStr("vendor_type"), dbRow.getValAsStr("name"), dbRow.getValAsStr("description"), dbRow.getValAsStr("website_url"), dbRow.getValAsStr("logo_name"), "");
                    result.push(model);
                }
                resolve(result);
            }).catch((error) => {
                cli_logger_1.Logger.logError("Error Gettings Vendors", error);
                reject(error);
            });
        });
    }
    //
    // Get Stored (mined) Bids
    //
    obsolete_getBidList(barcode) {
        let result = new Array();
        let sql = `SELECT * FROM product_bid WHERE barcode='${barcode}'`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                for (let i = 0; i < dbRes.result.rowCount(); i++) {
                    let dbRow = dbRes.result.dataRows[i];
                    let model = new product_bid_model_1.ProductBidModel(dbRow.getValAsStr("id"), dbRow.getValAsStr("vendor_id"), dbRow.getValAsStr("product_id"), dbRow.getValAsStr("barcode"), dbRow.getValAsStr("buy_price"), dbRow.getValAsStr("sell_price"));
                    result.push(model);
                }
                resolve(result);
            }).catch((error) => {
                cli_logger_1.Logger.logError("Error Gettings Vendors", error);
                reject(error);
            });
        });
    }
    /**
     *
     * @param {string} barcode
     * @param {boolean} fullResult
     * @param {boolean} extendedProdData
     * @param {boolean} debug
     * @returns {Promise<SearchResult>}
     */
    obsolete_getProductOffers(barcode, includeVendors, extendedProdData, debug = false) {
        let scope = this;
        let result = new search_result_1.SearchResult();
        function getProductInfo() {
            return this.getProduct(barcode, extendedProdData, debug);
        }
        //		getBidList(barcode: string): Promise<Array<ProductBidModel>>
        function getVendors() {
            if (includeVendors) {
                return this.getVendors;
            }
            else {
            }
        }
        function execute() {
            return __awaiter(this, void 0, void 0, function* () {
                let product = yield scope.getProduct(barcode, extendedProdData, debug);
            });
        }
        ///
        /// Compile the final search result
        ///
        return new Promise((resolve, reject) => {
            return execute().then(() => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
            /*

            return this.getProduct(barcode, extendedProdData, debugMode).then((product) => {
                result.setProduct(product);



            }).then((vendorArray) => {
                result.vendors = vendorArray;

                return this.getBidList(barcode).then((bids) => {
                    return bids;
                });
            }).then((bidsArray) => {
                result.bids = bidsArray; //setBidList(bidsList);

                resolve(result);
            });*/
        });
    }
}
exports.ProductDb = ProductDb;
if (cli_commander_1.CliCommander.debug()) {
    console.log("DEBUG!");
    let debug = new ProductDb();
    debug.getProduct("0819338020068").then((res) => {
        console.log("ProductDb ::", res);
    }).catch((err) => {
        console.log("ProductDb :: err", err);
    });
}
else {
    console.log("NO DEBUG!");
}
