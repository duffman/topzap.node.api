"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const basket_item_model_1 = require("@zapModels/basket-item.model");
const basket_model_1 = require("@zapModels/basket.model");
const prand_num_1 = require("@putte/prand-num");
const product_db_1 = require("@db/product-db");
const barcode_parser_1 = require("@zaplib/barcode-parser");
class BasketHandler {
    constructor(sessManager) {
        this.sessManager = sessManager;
    }
    getSessionBasket(sessId) {
        return this.sessManager.getSessionBasket(sessId);
    }
    addToBasket(sessId, offerData) {
        let scope = this;
        let sessBasket = this.getSessionBasket(sessId);
        if (!offerData.accepted) {
            console.log("NOT ACCEPTED");
            return false;
        }
        let vendorOffer = parseFloat(offerData.offer);
        let resultItem = new basket_item_model_1.BasketItem(prand_num_1.PRandNum.randomNum(), offerData.code, offerData.vendorId, offerData.title, vendorOffer);
        return this.addToVendorBasket(sessId, resultItem);
    }
    addToVendorBasket(sessId, item) {
        let basket = this.getVendorBasket(sessId, item.vendorId);
        let existingItem = basket.items.find(o => o.code === item.code);
        if (typeof existingItem === "object") {
            existingItem.count++;
        }
        else {
            basket.items.push(item);
        }
        return true;
    }
    getVendorBasket(sessId, vendorId) {
        let result = null;
        let sessBasket = this.getSessionBasket(sessId);
        for (let i = 0; i < sessBasket.data.length; i++) {
            let basket = sessBasket.data[i];
            if (basket.vendorId === vendorId) {
                result = basket;
                break;
            }
        }
        if (result === null) {
            result = new basket_model_1.VendorBasketModel(vendorId);
            sessBasket.data.push(result);
        }
        return result;
    }
    getBasketTotal(basket) {
        let total = 0;
        for (let index in basket.items) {
            let item = basket.items[index];
            total = total + item.offer;
        }
        return total;
    }
    getBestBasket(sessId) {
        let vendorBaskets = this.getSessionBasket(sessId);
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
    getFullBasket(sessId) {
        let sessBasket = this.getSessionBasket(sessId);
        console.log("getFullBasket :: sessBasket ::", sessBasket);
        return sessBasket;
    }
    sortSessionBasket(sessionBasket) {
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
    getExtSessionBasket(sessId) {
        let scope = this;
        let sessBasket = this.getFullBasket(sessId);
        let prodDb = new product_db_1.ProductDb();
        let codes = this.getBasketCodes(sessBasket);
        function getProducts() {
            return new Promise((resolve, reject) => {
                let codes = scope.getBasketCodes(sessBasket);
                return prodDb.getProducts(codes).then(res => {
                    resolve(res);
                }).catch(err => {
                    console.log("getExtSessionBasket :: err ::", err);
                    reject(err);
                });
            });
        }
        function getVendors() {
            return new Promise((resolve, reject) => {
                return prodDb.getVendors().then(res => {
                    resolve(res);
                }).catch(err => {
                    console.log("getExtSessionBasket :: err ::", err);
                });
            });
        }
        function getSessionBasket() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let prodData = yield getProducts();
                    sessBasket.productData = prodData;
                    let vendorData = yield getVendors();
                    sessBasket.vendorData = vendorData;
                    sessBasket = scope.sortSessionBasket(sessBasket);
                }
                catch (err) {
                    console.log("getExtSessionBasket :: getSessionBasket ::", err);
                }
            });
        }
        return new Promise((resolve, reject) => {
            getSessionBasket().then(() => {
                resolve(sessBasket);
            });
        });
    }
    showBasket(sessId) {
        let basket = this.sessManager.getSessionBasket(sessId);
        for (const vendorData of basket.data) {
            console.log("BASKET :: VENDOR ::", vendorData.vendorId);
            for (const item of vendorData.items) {
                console.log("  ITEM ::", item);
            }
        }
    }
}
exports.BasketHandler = BasketHandler;
