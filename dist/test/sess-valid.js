"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const session_basket_1 = require("../app/zap-ts-models/session-basket");
let basketSess = new session_basket_1.SessionBasket();
console.log("typeof basketSess", typeof basketSess);
let kalle1 = (basketSess instanceof session_basket_1.SessionBasket);
//export function from<T>(input: ObservableInput<T>, scheduler?: SchedulerLike): Observable<T> {
console.log("kalle1 ::", kalle1);
//console.log("kalle2 ::", kalle2);
