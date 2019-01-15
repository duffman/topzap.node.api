"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const session_pull_result_1 = require("@zapModels/messages/session-pull-result");
const api_routes_1 = require("@api/api-routes");
const basket_item_model_1 = require("@zapModels/basket/basket-item.model");
const vendor_basket_model_1 = require("@zapModels/basket/vendor-basket.model");
const basket_add_result_1 = require("@zapModels/basket/basket-add-result");
const session_basket_1 = require("@zapModels/session-basket");
const zap_basket_model_1 = require("@zapModels/zap-basket.model");
const price_search_service_1 = require("@core/price-search-engine/price.search-service");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const controller_utils_1 = require("@api/controller.utils");
const product_api_controller_1 = require("@api/rest/product-api.controller");
const prand_num_1 = require("@putte/prand-num");
const pvar_utils_1 = require("@putte/pvar-utils");
const phttp_client_1 = require("@putte/inet/phttp-client");
class BasketApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.searchService = new price_search_service_1.PriceSearchService(null);
    }
    echoDebug() {
        for (let i = 0; i < this.sessionBasket.data.length; i++) {
            let basket = this.sessionBasket.data[i];
            console.log("Vendor :: " + basket.vendorId, basket.items);
        }
    }
    getSessionBasket() {
        try {
            if (this.reqSession.sessionBasket) {
                this.sessionBasket = this.reqSession.sessionBasket;
                console.log("SESSION BASKET ::", this.sessionBasket);
            }
            else {
                this.reqSession.sessionBasket = new session_basket_1.SessionBasket();
                this.sessionBasket = this.reqSession.sessionBasket;
            }
            return this.sessionBasket;
        }
        catch (ex) {
            return null;
        }
    }
    setSessionBasket(basket = null) {
        let result = false;
        try {
            if (basket === null) {
                basket = this.sessionBasket;
            }
            this.reqSession.sessionBasket = basket; //this.sessionBasket;
            result = true;
        }
        catch (err) {
            console.log("setSessionBasket :: err ::", err);
            result = false;
        }
        return result;
    }
    validateSessionBasket(sessionBasket = null) {
        let result = false;
        let basketSess = this.getSessionBasket();
        result = basketSess !== null && (basketSess instanceof session_basket_1.SessionBasket);
        return result;
    }
    /**
     * Create a bew session basket and stores it to the
     * persistent session.
     * @param {boolean} preserveExisting - do not overwrite existing session basket
     * @returns {boolean}
     */
    initSessionBasket(keepExisting) {
        let result = false;
        //		let haveExisintg = keepExisting && getSessionBasket()
        try {
        }
        catch (err) {
            console.log("setSessionBasket :: err ::", err);
            result = false;
        }
        return result;
    }
    getHighestBidder(offerData) {
        let highVendor = null;
        offerData.vendors = pvar_utils_1.PVarUtils.isNullOrUndefined(offerData.vendors)
            ? new Array() : offerData.vendors;
        for (let i = 0; i < offerData.vendors.length; i++) {
            let vendor = offerData.vendors[i];
            if (!vendor.accepted) {
                console.log("NOT ACCEPTED");
                continue;
            }
            if (highVendor === null) {
                highVendor = vendor;
            }
            let highOffer = parseFloat(highVendor.offer);
            let vendorOffer = parseFloat(vendor.offer);
            if (vendorOffer > highOffer) {
                highVendor = vendor;
            }
        }
        return highVendor;
    }
    getVendorBasket(vendorId) {
        let result = null;
        for (let i = 0; i < this.sessionBasket.data.length; i++) {
            let basket = this.sessionBasket.data[i];
            if (basket.vendorId === vendorId) {
                result = basket;
                break;
            }
        }
        if (result === null) {
            result = new vendor_basket_model_1.VendorBasketModel(vendorId);
            this.sessionBasket.data.push(result);
        }
        return result;
    }
    /**
     *  TODO: The amount (doubles) should be controlled by the miner
     * @param {IBasketItem} item
     * @returns {boolean}
     */
    addToVendorBasket(item) {
        let basket = this.getVendorBasket(item.vendorId);
        let existingItem = basket.items.find(o => o.code === item.code);
        if (typeof existingItem === "object") {
            existingItem.count++;
        }
        else {
            basket.items.push(item);
        }
        return true;
    }
    addToBasket(code, offerData) {
        let scope = this;
        let vendorBaskets = this.getSessionBasket();
        let highVendor = null;
        let highBidItem = null;
        for (let i = 0; i < offerData.vendors.length; i++) {
            let vendor = offerData.vendors[i];
            if (!vendor.accepted) {
                console.log("NOT ACCEPTED");
                continue;
            }
            let vendorOffer = parseFloat(vendor.offer);
            let resultItem = new basket_item_model_1.BasketItem(prand_num_1.PRandNum.randomNum(), 1, code, vendor.vendorId, vendor.title, vendorOffer);
            this.addToVendorBasket(resultItem);
            if (highVendor === null) {
                highVendor = vendor;
                highBidItem = resultItem;
            }
            let highOffer = parseFloat(highVendor.offer);
            if (vendorOffer > highOffer) {
                highVendor = vendor;
                highBidItem = resultItem;
            }
        }
        console.log("1 ::");
        let bestBasket = this.getBestBasket();
        console.log("2 ::");
        let addResult = new basket_add_result_1.BasketAddResult(highBidItem !== null, highBidItem, bestBasket);
        console.log("3 ::");
        this.setSessionBasket();
        console.log("BASKETS ::", this.sessionBasket);
        this.echoDebug();
        return addResult;
    }
    /**
     * Returns the total basket value
     * @param {IBasketModel} basket
     */
    getBasketTotal(basket) {
        let total = 0;
        for (let index in basket.items) {
            let item = basket.items[index];
            total = total + item.offer;
        }
        return total;
    }
    getBestBasket() {
        let vendorBaskets = this.getSessionBasket();
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
    /**
     * Add product info to the session basket
     * TODO: Fucking fuck in the fuck suck donkey ass, doing this makes me responsible for the
     * TODO: product info life cycle, in othere fucking suck words, if the item is deleted so shall the info...
     * @param {string} reqCode
     * @param {IBasketAddResult} basketResult
     */
    addProductInfoToSession(code) {
        let scope = this;
        let sessionBasket = this.getSessionBasket();
        console.log("%%%%% ::: sessionBasket :::", sessionBasket);
        let data = sessionBasket.productData;
        console.log("%%%%% ::: sessionBasket.productData :::", sessionBasket.productData);
        if (!data) {
            scope.sessionBasket.productData = new Array();
            scope.setSessionBasket();
        }
        function haveProductData(code) {
            for (let index in data) {
                let prod = data[index];
                if (prod.code === code) {
                    return true;
                }
            }
            return false;
        }
        return new Promise((resolve, reject) => {
            if (haveProductData(code)) {
                resolve(true);
            }
            else {
                let prodApi = new product_api_controller_1.ProductApiController();
                return prodApi.getProduct(code).then(res => {
                    scope.sessionBasket.productData.push(res);
                    scope.setSessionBasket();
                    resolve(true);
                }).catch(err => {
                    resolve(false);
                });
            }
        });
    }
    apiDeleteBasketItem(req, resp) {
        let data = req.body;
        let code = data.code;
        let basket = this.getSessionBasket();
        let prodIdx = basket.productData.indexOf(basket.productData.find(i => i.code === code));
        // Remove cached product data
        if (pvar_utils_1.PVarUtils.isNumber(prodIdx)) {
            basket.productData.splice(prodIdx, 1);
        }
        // Remove basked item in all vendor baskets
        for (let vendorBasket of basket.data) {
            let itemIdx = vendorBasket.items.indexOf(vendorBasket.items.find(i => i.code === code));
            if (pvar_utils_1.PVarUtils.isNumber(itemIdx)) {
                vendorBasket.items.splice(itemIdx, 1);
                // If this was the last item, let´s remove the vendor basket from the
                // data array of Session vendor baskets
                if (vendorBasket.items.length === 0) {
                    vendorBasket = null;
                }
            }
        }
        // Remove all vendor basket that contais no items...
        basket.data = basket.data.filter((vendorBasket) => {
            return vendorBasket !== null && vendorBasket.items.length > 0;
        });
        this.setSessionBasket(basket);
        // Call the get session basket in order to return
        // the current basket
        this.apiPullSession(req, resp);
        console.log("NEW BASKET :: DELETE ::", basket);
        console.log("DELETE ::", code);
    }
    apiAddBasketItem(req, resp) {
        let scope = this;
        let result;
        this.reqSession = req.session;
        let data = req.body;
        let code = data.code;
        console.log("%%%%% ::: Add TO BASKET");
        async function doAdd() {
            let addRes = await scope.addProductInfoToSession(code);
            console.log("%%%%% ::: addRes :::", addRes);
            let searchResult = await scope.callSearchService(code);
            console.log("%%%%% ::: searchResult :::", searchResult);
            result = scope.addToBasket(code, searchResult);
            // Send the product data, it´s up to the client to render each item with product
            // result info, it was this or send prod data for each item, this produces a ligher
            // result but we have to manage the life cycle of the prod result, i.e no basket item with
            // the product code, drop the product...
            result.prodData = scope.sessionBasket.productData;
            console.log("%%%%% ::: scope.sessionBasket.productData ::", scope.sessionBasket.productData);
            console.log("%%%%% ::: scope.addToBasket ::", result);
            console.log("%%%%% ::: apiAddBasketItem ::", scope.sessionBasket);
        }
        doAdd().then(() => {
            resp.setHeader('Content-Type', 'application/json');
            console.log("%%%%% ::: Result ::", result);
            //let addResult = scope.addToBasket(code, searchRes);
            resp.json(result);
        }).catch(err => {
            controller_utils_1.ApiControllerUtils.internalError(resp);
            cli_logger_1.Logger.logError("SearchWsApiController :: error ::", err);
        });
    }
    apiGetBasket(req, resp) {
        this.reqSession = req.session;
        let basketResult = new zap_basket_model_1.ZapBasketData();
        /*
        let bestBasket = this.getBestBasket(req);
        let basketTotal = this.getBasketTotal(bestBasket);
        */
        // resp.setHeader('Content-Type', 'text/html')
        resp.setHeader('Content-Type', 'application/json');
        resp.end(JSON.stringify(basketResult));
    }
    /**
     * Returns the full basket session containing all vendors
     * @param {Request} req
     * @param {e.Response} resp
     */
    apiBasketReview(req, resp, next) {
        try {
            let sessionPullResult = new session_pull_result_1.SessionPullResult(true);
            let sessionBasket = this.getSessionBasket();
            sessionPullResult.data = sessionBasket.data;
            sessionPullResult.productData = sessionBasket.productData;
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify(sessionPullResult));
        }
        catch (err) {
            cli_logger_1.Logger.logError("apiBasketReview ::", err);
            next(err);
        }
    }
    apiClearBasket(req, resp, next) {
        try {
        }
        catch (ex) {
            cli_logger_1.Logger.logError("pullSessionBasket :: error ::", ex);
        }
    }
    /**
     * Returns the stores session basket, this method is usually called by the
     * client upon a reload...
     *
     * There´s some special trix here, we need to remove all vendors but the best
     * bidding vendor (the best basket)
     *
     * @param {e.Request} req
     * @param {e.Response} resp
     */
    apiPullSession(req, resp) {
        resp.setHeader('Content-Type', 'application/json');
        try {
            let sessionBasket = this.getSessionBasket();
            console.log("¤ apiPullSession ::", sessionBasket);
            let bestBasket = this.getBestBasket();
            console.log("¤ bestBasket ::", bestBasket);
            // Emulate the add where we only send the best basket
            // We might get some unwanted product info if a lower bid basket have product that
            // the best basket don´t have, but what the hell...
            let sessionPullResult = new session_pull_result_1.SessionPullResult(true);
            console.log("¤ sessionPullResult ::", sessionPullResult);
            try {
                let tmpSessionBasket = new session_basket_1.SessionBasket();
                console.log("¤ 1 > tmpSessionBasket ::", tmpSessionBasket);
                tmpSessionBasket.productData = sessionBasket.productData;
                console.log("¤ 2 > tmpSessionBasket.productData ::", tmpSessionBasket.productData);
                let bestBasketResult = bestBasket;
                console.log("¤ 3 > bestBasketResult ::", bestBasketResult);
                if (bestBasketResult !== null) {
                    console.log("¤ 3:a > bestBasketResult !== null");
                    tmpSessionBasket.data.push(bestBasketResult);
                }
                else {
                    console.log("¤ 3:b > bestBasketResult !== null");
                }
                sessionPullResult.productData = tmpSessionBasket.productData;
                sessionPullResult.data = tmpSessionBasket.data;
            }
            catch (err) {
                sessionPullResult.success = false;
            }
            resp.setHeader('Content-Type', 'application/json');
            resp.end(JSON.stringify(sessionPullResult));
        }
        catch (ex) {
            cli_logger_1.Logger.logError(`apiPullSession :: `, ex);
            controller_utils_1.ApiControllerUtils.bogusError(resp, "GraphQL Error: 478");
        }
    }
    attachWSS(wss) {
    }
    initRoutes(routes) {
        routes.get(api_routes_1.ApiRoutes.Basket.GET_BASKET, this.apiGetBasket.bind(this));
        routes.post(api_routes_1.ApiRoutes.Basket.POST_BASKET_ADD, this.apiAddBasketItem.bind(this));
        routes.post(api_routes_1.ApiRoutes.Basket.POST_BASKET_DELETE, this.apiDeleteBasketItem.bind(this));
        routes.post(api_routes_1.ApiRoutes.Basket.POST_BASKET_CLEAR, this.apiClearBasket.bind(this));
        routes.post(api_routes_1.ApiRoutes.Basket.POST_BASKET_REVIEW, this.apiBasketReview.bind(this));
        routes.post(api_routes_1.ApiRoutes.Basket.POST_BASKET_SESS_PULL, this.apiPullSession.bind(this));
    }
    doSearch(code) {
        let url = zappy_app_settings_1.Settings.PriceServiceApi.Endpoint + "/" + code;
        return new Promise((resolve, reject) => {
            phttp_client_1.PHttpClient.getHttp(url).then((res) => {
                cli_logger_1.Logger.logGreen("PriceSearchService :: doSearch :: success ::", res);
                resolve(res);
            }).catch((err) => {
                cli_logger_1.Logger.logGreen("PriceSearchService :: doSearch :: error ::", err);
                reject(err);
            });
        });
    }
    callSearchService(code) {
        cli_logger_1.Logger.logGreen("callSearchService");
        let url = zappy_app_settings_1.Settings.PriceServiceApi.Endpoint;
        return new Promise((resolve, reject) => {
            return this.doSearch(code).then((searchResult) => {
                console.log("callSearchService :: doSearch ::", searchResult);
                //let result = ZapOfferResult.toZapRes(searchResult);
                resolve(null);
            }).catch((err) => {
                console.log("callSearchService :: error ::", err);
                resolve(err);
            });
        });
    }
}
exports.BasketApiController = BasketApiController;
