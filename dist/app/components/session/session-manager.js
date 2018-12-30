"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const basket_collection_1 = require("@zapModels/basket-collection");
const cli_logger_1 = require("@cli/cli.logger");
class SessionManager {
    assignRequest(httpRequest) {
        this.httpRequest = httpRequest;
        this.reqSession = httpRequest.session;
    }
    getSessionBasket() {
        try {
            if (this.reqSession.sessionBasket) {
                this.sessionBasket = this.reqSession.sessionBasket;
                cli_logger_1.Logger.logOut("Session Basket ::", this.sessionBasket);
            }
            else {
                this.reqSession.sessionBasket = new basket_collection_1.SessionBasket();
                this.sessionBasket = this.reqSession.sessionBasket;
            }
            return this.sessionBasket;
        }
        catch (ex) {
            return null;
        }
    }
    setSessionBasket(basket = null) {
        try {
            if (basket === null) {
                basket = this.sessionBasket;
            }
            this.reqSession.sessionBasket = basket; //this.sessionBasket;
        }
        catch (err) {
            console.log("setSessionBasket :: err ::", err);
            return false;
        }
        return true;
    }
}
exports.SessionManager = SessionManager;
