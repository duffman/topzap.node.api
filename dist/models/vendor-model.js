"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
class VendorModel {
    constructor(id, identifier, vendorType, name, description, websiteUrl, logoName, logoUrl) {
        this.id = id;
        this.identifier = identifier;
        this.vendorType = vendorType;
        this.name = name;
        this.description = description;
        this.websiteUrl = websiteUrl;
        this.logoName = logoName;
        this.logoUrl = logoUrl;
    }
}
exports.VendorModel = VendorModel;
