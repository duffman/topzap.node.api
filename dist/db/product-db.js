"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const logger_1 = require("@cli/logger");
const database_manager_1 = require("@db/database-manager");
const product_model_1 = require("@models/product-model");
const vendor_model_1 = require("@models/vendor-model");
const product_bid_model_1 = require("@models/product-bid-model");
const search_result_1 = require("@models/search-result");
const platform_type_parser_1 = require("@utils/platform-type-parser");
const putte_string_utils_1 = require("@putte/putte-string-utils");
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
    getProduct(barcode, extended, debug = false) {
        function generateSql() {
            if (!debug) {
                return `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`;
            }
            else {
                return `SELECT games.* FROM games, product_edition AS edition WHERE games.id = edition.game_id ORDER BY RAND() LIMIT 1`;
            }
        }
        let sql = generateSql();
        logger_1.Logger.logGreen("SQL ::", sql);
        function createProductModel(dbRow) {
            if (dbRow.isEmpty) {
                return new product_model_1.ProductModel();
            }
            else {
                return new product_model_1.ProductModel(dbRow.getValAsStr("id"), dbRow.getValAsStr("platform_name"), dbRow.getValAsStr("title"), dbRow.getValAsStr("publisher"), dbRow.getValAsStr("developer"), dbRow.getValAsStr("genre"), dbRow.getValAsStr("cover_image"), dbRow.getValAsStr("thumb_image"), dbRow.getValAsStr("video_source"), dbRow.getValAsStr("source"), dbRow.getValAsStr("release_date"));
            }
        }
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let dbRow = dbRes.safeGetFirstRow();
                let model = createProductModel(dbRow);
                let havePlatformAndTitle = !putte_string_utils_1.PStrUtils.isEmpty(model.platformName) && !putte_string_utils_1.PStrUtils.isEmpty(model.title);
                //
                // Add extended properties
                //
                if (extended && !dbRow.isEmpty && havePlatformAndTitle) {
                    logger_1.Logger.logYellow("Adding extended properties to:", model.title);
                    let gpp = new platform_type_parser_1.PlatformTypeParser();
                    model.platformIcon = gpp.parseFromName(model.title, true);
                    model.platformImage = gpp.parseFromName(model.platformName, false);
                    logger_1.Logger.logCyan("getProduct() :: Model", model);
                }
                resolve(model);
            }).catch((error) => {
                logger_1.Logger.logError("getProduct() :: error ::", error);
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
                logger_1.Logger.logError("Error Gettings Vendors", error);
                reject(error);
            });
        });
    }
    //
    // Get Bids
    //
    getBidList(barcode) {
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
                logger_1.Logger.logError("Error Gettings Vendors", error);
                reject(error);
            });
        });
    }
    /**
     *
     * @param {string} barcode
     * @returns {Promise<SearchResult>}
     */
    getProductOffers(barcode, fullResult, extendedProdData, debug = false) {
        let result = new search_result_1.SearchResult();
        ///
        /// Compile the final search result
        ///
        return new Promise((resolve, reject) => {
            return this.getProduct(barcode, extendedProdData, debug).then((product) => {
                result.setProduct(product);
                if (fullResult) {
                    return this.getVendors().then((vendors) => {
                        return vendors;
                    });
                }
                else {
                    return [];
                }
            }).then((vendorArray) => {
                result.vendors = vendorArray;
                return this.getBidList(barcode).then((bids) => {
                    return bids;
                });
            }).then((bidsArray) => {
                result.bids = bidsArray; //setBidList(bidsList);
                resolve(result);
            });
        });
    }
}
exports.ProductDb = ProductDb;
