"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SearchResult {
    constructor() {
        this.success = true;
    }
    setProduct(product) {
        this.product = product;
    }
    setVendorList(vendors) {
        //this.vendors = vendors;
    }
    setBidList(bidList) {
        //this.bidlist = bidList;
    }
    setErrorMessage(message) {
        this.success = false;
        this.errorMessage = message;
    }
}
exports.SearchResult = SearchResult;
