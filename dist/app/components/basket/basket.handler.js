"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const basket_item_model_1 = require("@zapModels/basket/basket-item.model");
const vendor_basket_model_1 = require("@zapModels/basket/vendor-basket.model");
const session_basket_1 = require("@zapModels/session-basket");
const prand_num_1 = require("@putte/prand-num");
const product_db_1 = require("@db/product-db");
const barcode_parser_1 = require("@zaplib/barcode-parser");
const session_keys_1 = require("@app/types/session-keys");
const cli_logger_1 = require("@cli/cli.logger");
const basket_utils_1 = require("@components/basket/basket-utils");
const util_1 = require("util");
class BasketHandler {
    constructor() { }
    getSessionBasket(session) {
        console.log("Get Session Basket >>>> A:2");
        //let res = session.getAs<ISessionBasket>(SessionKeys.Basket);
        let res = session.get(session_keys_1.SessionKeys.Basket);
        if (!res) {
            res = this.ensureBasket(res);
            session.set(session_keys_1.SessionKeys.Basket, res);
        }
        console.log("Get Session Basket >>>> A:3", res);
        return res;
    }
    ensureBasket(sessionBasket) {
        if (!sessionBasket) {
            sessionBasket = new session_basket_1.SessionBasket();
            console.log("ensureBasket >> We´re creating the basket ::", sessionBasket.data);
        }
        return sessionBasket;
    }
    addToBasket(session, offerData) {
        let scope = this;
        console.log("Get Session Basket >>>> A:1");
        let sessBasket = this.getSessionBasket(session);
        cli_logger_1.Logger.logPurple("## addToBasket");
        basket_utils_1.BasketUtils.showBasket(sessBasket);
        // We have added to the basket
        cli_logger_1.Logger.logPurple("## BEGIN::BASKET ## addToBasket ##");
        basket_utils_1.BasketUtils.showBasket(sessBasket);
        cli_logger_1.Logger.logPurple("## END:BASKET ##");
        if (!offerData.accepted) {
            console.log("NOT ACCEPTED");
            return false;
        }
        let vendorOffer = parseFloat(offerData.offer);
        let resultItem = new basket_item_model_1.BasketItem(prand_num_1.PRandNum.randomNum(), 1, offerData.code, offerData.vendorId, offerData.title, vendorOffer);
        return this.addToVendorBasket(session, resultItem);
    }
    getVendorBasket(sessBasket, vendorId) {
        let result = null;
        console.log("Get getVendorBasket ##### sessBasket.data", sessBasket.data);
        if (!sessBasket.data) {
            console.log("IT WAS UNASSIGNED!!!!!");
            sessBasket.data = new Array(); //VendorBasketModel(vendorId);
        }
        for (let i = 0; i < sessBasket.data.length; i++) {
            let basket = sessBasket.data[i];
            if (basket.vendorId === vendorId) {
                result = basket;
                break;
            }
        }
        if (result === null) {
            result = new vendor_basket_model_1.VendorBasketModel(vendorId);
            sessBasket.data.push(result);
        }
        console.log("WE`re FINE!!!!!");
        return result;
    }
    addToVendorBasket(session, item) {
        let sessBasket = this.getSessionBasket(session);
        let basket = this.getVendorBasket(sessBasket, item.vendorId);
        cli_logger_1.Logger.logPurple(":::::::: BASKET BEFORE ADD :::::::::::");
        let cp = session.get(session_keys_1.SessionKeys.Basket);
        basket_utils_1.BasketUtils.showBasket(cp);
        cli_logger_1.Logger.logPurple(":::::::: ////// BASKET BEFORE ADD :::::::::::");
        let existingItem = basket.items.find(o => o.code === item.code);
        if (typeof existingItem === "object") {
            existingItem.count++;
        }
        else {
            basket.items.push(item);
        }
        console.log("\n\n");
        //let cp = session.get(SessionKeys.Basket);
        basket_utils_1.BasketUtils.showBasket(sessBasket);
        console.log(":: INSPECT ::", util_1.inspect(sessBasket));
        console.log("\n\n");
        session.set(session_keys_1.SessionKeys.Basket, sessBasket);
        return true;
    }
    getBasketTotal(basket) {
        let total = 0;
        if (basket.items === null)
            return 0;
        for (let index in basket.items) {
            let item = basket.items[index];
            total = total + item.offer;
        }
        return total;
    }
    getBestBasket(session) {
        let vendorBaskets = this.getSessionBasket(session);
        let bestTotal = 0;
        let bestBaset = null;
        console.log("getBestBasket ::", bestBaset);
        for (let index in vendorBaskets.data) {
            let basket = vendorBaskets.data[index];
            let total = this.getBasketTotal(basket);
            if (total > bestTotal) {
                bestTotal = total;
                bestBaset = basket;
            }
        }
        return bestBaset;
    }
    extendSessionBasket(data) {
        let prodDb = new product_db_1.ProductDb();
        return new Promise((resolve, reject) => {
            prodDb.getProducts(['0819338020068', '0887195000424']).then(res => {
            }).catch(err => {
                console.log("extendSessionBasket :: err ::", err);
            });
        });
    }
    /**
     * Extract all barcodes from the session basket
     * @param {ISessionBasket} sessionBasket
     * @returns {string[]}
     */
    getBasketCodes(sessionBasket) {
        let result = new Array();
        if (!sessionBasket) {
            return result;
        }
        function addBarcode(code) {
            code = barcode_parser_1.BarcodeParser.prepEan13Code(code);
            if (result.indexOf(code) === -1) {
                result.push(code);
            }
        }
        for (const vendorBasket of sessionBasket.data) {
            for (const item of vendorBasket.items) {
                addBarcode(item.code);
            }
        }
        return result;
    }
    getFullBasket(session) {
        let sessBasket = this.getSessionBasket(session);
        console.log("getFullBasket :: sessBasket ::", sessBasket);
        return sessBasket;
    }
    sortSessionBasket(sessionBasket) {
        this.ensureBasket(sessionBasket);
        for (const basket of sessionBasket.data) {
            basket.totalValue = this.getBasketTotal(basket);
        }
        sessionBasket.data = sessionBasket.data.sort((x, y) => {
            if (x.totalValue > y.totalValue) {
                return -1;
            }
            if (x.totalValue < y.totalValue) {
                return 1;
            }
            return 0;
        });
        return sessionBasket;
    }
    /**
     * Attaches
     * @param {ISessionBasket} sessBasket
     * @param {IVendorModel[]} vendors
     */
    attachVendors(sessBasket, vendors) {
        function getVendorDataById(vendorId) {
            let result = null;
            for (let vendorData of vendors) {
                if (vendorData.id === vendorId) {
                    result = vendorData;
                    break;
                }
            }
            return result;
        }
        for (let vendorBasket of sessBasket.data) {
            let vendorData = getVendorDataById(vendorBasket.vendorId);
            vendorBasket.vendorData = vendorData;
        }
    }
    /**
     * Calculate total value of each basket
     * @param {ISessionBasket} sessBasket
     */
    calcBasketTotals(sessBasket) {
        if (!sessBasket.data) {
            cli_logger_1.Logger.logError("calcBasketTotals :: no data");
            return;
        }
        for (let vendorBasket of sessBasket.data) {
            vendorBasket.totalValue = this.getBasketTotal(vendorBasket);
        }
    }
    /**
     * Get Session Basket with Vendor Data attached to each Vendor Basket
     * @param {string} sessId
     * @returns {Promise<ISessionBasket>}
     */
    getExtSessionBasket(session) {
        let scope = this;
        let sessBasket = this.getFullBasket(session);
        let prodDb = new product_db_1.ProductDb();
        let codes = this.getBasketCodes(sessBasket);
        function getProducts() {
            console.log("getProducts >>>>>");
            return new Promise((resolve, reject) => {
                let codes = scope.getBasketCodes(sessBasket);
                return prodDb.getProducts(codes).then(res => {
                    console.log("FETRES :::", res);
                    resolve(res);
                }).catch(err => {
                    console.log("getExtSessionBasket :: err ::", err);
                    reject(err);
                });
            });
        }
        function getVendors() {
            console.log("getVendors >>>>>");
            return new Promise((resolve, reject) => {
                return prodDb.getVendors().then(res => {
                    resolve(res);
                }).catch(err => {
                    console.log("getExtSessionBasket :: err ::", err);
                });
            });
        }
        function getProdData(code, prodData) {
            console.log("getProdData >>>>>");
            let res = null;
            for (let prod of prodData) {
                if (prod.code === code) {
                    res = prod;
                    break;
                }
            }
            return res;
        }
        function attachProductInfoToItem(sessBasket) {
            console.log("attachProductInfoToItem >>>>>");
            scope.ensureBasket(sessBasket);
            for (let vb of sessBasket.data) {
                for (let item of vb.items) {
                    let prodData = getProdData(item.code, sessBasket.productData);
                    item.thumbImage = prodData.thumbImage;
                    item.platformIcon = prodData.platformIcon;
                    item.releaseDate = prodData.releaseDate;
                    console.log("YAYAYAYAY prodData:::", prodData);
                }
            }
        }
        async function getSessionBasket() {
            try {
                let prodData = await getProducts();
                sessBasket.productData = prodData;
                let vendors = await getVendors();
                console.log("getSessionBasket ::", prodData);
                // Sort the basket according to highest basket value
                sessBasket = scope.sortSessionBasket(sessBasket);
                // HACK TO ATTACH PROD DATA TO IBasketItem decendant IGameBasketItem
                attachProductInfoToItem(sessBasket);
                //Hack
                for (let vbasket of sessBasket.data) {
                    vbasket.highestBidder = false;
                }
                // Set Highest Bidder Property to the first vendor...
                if (sessBasket.data.length > 0) {
                    sessBasket.data[0].highestBidder = true;
                    console.log("HIGH BID SET ::", sessBasket.data[0]);
                }
                for (let b of sessBasket.data) {
                    console.log("BDATA ::", b);
                }
                // Duffman: 2019-01-05 Breaking Change, attach vendor data to each
                // basket instead of attached directly to the root of the basket
                // sessBasket.vendorData = vendors;
                scope.attachVendors(sessBasket, vendors);
                scope.calcBasketTotals(sessBasket);
            }
            catch (err) {
                console.log("getExtSessionBasket :: getSessionBasket ::", err);
            }
        }
        return new Promise((resolve, reject) => {
            getSessionBasket().then(() => {
                resolve(sessBasket);
            }).catch(err => {
                cli_logger_1.Logger.logFatalError("getExtSessionBasket");
                reject(err);
            });
        });
    }
    showBasket(session) {
        let basket = this.getSessionBasket(session);
        for (const vendorData of basket.data) {
            console.log("BASKET :: VENDOR ::", vendorData.vendorId);
            for (const item of vendorData.items) {
                console.log("  ITEM ::", item);
            }
        }
    }
    /**
     * Remove product assicoated with a barcode from a session basket
     * @param {string} sessId
     * @param {string} code
     * @returns {boolean}
     */
    removeProductByCode(code, basket = null) {
        let result = false;
        basket.productData = !(basket.productData) ? new Array() : basket.productData;
        for (let i = 0; i < basket.productData.length; i++) {
            let product = basket.productData[i];
            if (product.code === code) {
                basket.productData.splice(i, 1);
                result = true;
                break;
            }
        }
        return result;
    }
    /**
     * Remove item by barcode from all vendor baskets
     * @param {string} sessId
     * @param {string} code
     * @param {ISessionBasket} basket
     */
    removeItemByCode(code, basket = null) {
        let result = false;
        this.removeProductByCode(code, basket);
        console.log("removeItemByCode :: removeProductByCode ::", basket);
        for (const vendorData of basket.data) {
            console.log("VENDOR BASKET ::", vendorData);
            for (let i = 0; i < vendorData.items.length; i++) {
                let item = vendorData.items[i];
                if (item.code === code) {
                    vendorData.items.splice(i, 1);
                    result = true;
                    break;
                }
            }
        }
        return result;
    }
}
exports.BasketHandler = BasketHandler;
