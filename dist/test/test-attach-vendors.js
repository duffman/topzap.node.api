"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const basket_ws_api_controller_1 = require("@api/ws/basket-ws-api.controller");
const session_basket_1 = require("@zapModels/session-basket");
const basket_product_item_1 = require("@zapModels/basket/basket-product-item");
const prand_num_1 = require("@putte/prand-num");
const product_db_1 = require("@db/product-db");
const database_manager_1 = require("@putteDb/database-manager");
const cli_logger_1 = require("@cli/cli.logger");
const basket_handler_1 = require("@components/basket/basket.handler");
const basket_item_model_1 = require("@zapModels/basket/basket-item.model");
const vendor_basket_model_1 = require("@zapModels/basket/vendor-basket.model");
let db = new database_manager_1.DbManager();
let prodDb = new product_db_1.ProductDb();
let basketWsApiController = new basket_ws_api_controller_1.BasketWsApiController(true);
let sessBasket = new session_basket_1.SessionBasket();
function getRandomCodes(count = 10) {
    let sql = `SELECT barcode FROM product_edition ORDER BY RAND() LIMIT ${count}`;
    let result = new Array();
    console.log("SQL ::", sql);
    return new Promise((resolve, reject) => {
        db.dbQuery(sql).then(res => {
            for (let row of res.result.dataRows) {
                console.log("getRandomCodes :: res ::", res);
                result.push(row.getValAsStr("barcode"));
            }
            resolve(result);
        }).catch(err => {
            cli_logger_1.Logger.logDebugErr("getRandomCodes :: error ::", err);
            reject(err);
        });
    });
}
function getRandomProduct() {
    let sql = `SELECT * FROM product_edition, games WHERE games.id = product_edition.game_id ORDER BY RAND() LIMIT 1`;
    return new Promise((resolve, reject) => {
    });
}
function createProductItem() {
    let id = prand_num_1.PRandNum.getRandomInt(10, 50);
    let item = new basket_product_item_1.GameBasketItem(id);
    return new Promise((resolve, reject) => {
    });
}
function toBasketItems(games) {
    let result = new Array();
    /*
     public zid: string,
     public code: string = null,
     public vendorId: number = null,
     public title: string = null,
     public offer: number = null,
     public publisher: string = null,
     public releaseDate: string = null,
     public thumbImage: string = null,
     public count: number =
    */
    for (let game of games) {
        result.push(new basket_item_model_1.BasketItem("2", 1, "CODE", -1, game.title, -1, game.publisher, game.releaseDate, game.thumbImage));
    }
    return result;
}
let randomCodes = getRandomCodes().then(res => {
    console.log("RANDOM CODES ::", res);
    return res;
}).then(codes => {
    return prodDb.getProducts(codes).then(products => {
        //console.log(products);
        let productData = toBasketItems(products);
        return productData;
    }).catch(err => {
        console.log("Error getting products");
    });
}).then(data => {
    return prodDb.getVendors().then(vendors => {
        let bh = new basket_handler_1.BasketHandler(null);
        //for (let vendor of vendors) {}
        let vendorBasket = new vendor_basket_model_1.VendorBasketModel(vendors[0].id);
        vendorBasket.items = data;
        sessBasket.data.push(vendorBasket);
        bh.attachVendors(sessBasket, vendors);
        return sessBasket;
    }).catch(err => {
        console.log("Error getting products");
    });
}).then((data) => {
    console.log("FINAL BASKET ::", data);
    let model = data.data[0];
    console.log("FINAL BASKET :: ITEMS ::", model.items);
    console.log("FINAL BASKET :: VENDOR ::", model.vendorData);
});
