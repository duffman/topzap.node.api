"use strict";
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
