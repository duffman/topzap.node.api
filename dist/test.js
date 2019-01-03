"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
let vendorId = 1;
/*
function createVendor(): IVendorModel {
    let model = new VendorModel();

    return model;
}
*/
function createBasket() {
    let basket = new basket_model_1.VendorBasketModel(vendorId);
    basket.items = new Array();
    let items = basket.items;
    for (let i = 0; i < 10; i++) {
        let zid = i.toString();
        let code = i + "000434343434";
        let vendorId = i;
        let title = "Item - " + i;
        let offer = prand_num_1.PRandNum.getRandomInt(1, 30);
        let count = 1;
        let item = new basket_item_model_1.BasketItem(zid, code, vendorId, title, offer, count);
        items.push(item);
    }
    vendorId++;
    return basket;
}
const session_basket_1 = require("@zapModels/session-basket");
const basket_model_1 = require("@zapModels/basket.model");
const prand_num_1 = require("@putte/prand-num");
const basket_item_model_1 = require("@zapModels/basket-item.model");
const basket_handler_1 = require("@components/basket/basket.handler");
let bh = new basket_handler_1.BasketHandler(null);
let sess = new session_basket_1.SessionBasket();
sess.data = new Array();
sess.data.push(createBasket());
sess.data.push(createBasket());
sess.data.push(createBasket());
sess.data.push(createBasket());
for (const basket of sess.data) {
    basket.totalValue = bh.getBasketTotal(basket);
}
sess.data = sess.data.sort((x, y) => {
    if (x.totalValue > y.totalValue) {
        return -1;
    }
    if (x.totalValue < y.totalValue) {
        return 1;
    }
    return 0;
});
function sortBy(field) {
    return function (a, b) {
        if (a[field] > b[field]) {
            return -1;
        }
        else if (a[field] < b[field]) {
            return 1;
        }
        return 0;
    };
}
console.log("CP ::", sess.data);
/*
var sortedArray: string[] = sess.data.sort((n1,totalValue, n2) => {
    if (n1 > n2) {
        return 1;
    }

    if (n1 < n2) {
        return -1;
    }

    return 0;
});
*/
//console.log(sess);
//console.log(sess.data[0]);
