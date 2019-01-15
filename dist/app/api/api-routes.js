"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ApiRoutes;
(function (ApiRoutes) {
    let Basket;
    (function (Basket) {
        Basket.GET_BASKET = "/basket";
        Basket.POST_BASKET_ADD = "/basket/add";
        Basket.POST_BASKET_DELETE = "/basket/del";
        Basket.POST_BASKET_CLEAR = "/basket/clear";
        Basket.POST_BASKET_REVIEW = "/basket/review";
        Basket.POST_BASKET_SESS_PULL = "/basket/pull";
    })(Basket = ApiRoutes.Basket || (ApiRoutes.Basket = {}));
})(ApiRoutes = exports.ApiRoutes || (exports.ApiRoutes = {}));
