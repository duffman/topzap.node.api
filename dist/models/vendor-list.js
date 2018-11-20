"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class VendorList {
    constructor() {
        this.list = Array();
    }
    addVendor(vendor) {
        this.list.push(vendor);
    }
}
exports.VendorList = VendorList;
