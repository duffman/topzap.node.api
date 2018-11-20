"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProductVendor {
}
exports.ProductVendor = ProductVendor;
var ProductType;
(function (ProductType) {
    ProductType[ProductType["Unset"] = 0] = "Unset";
    ProductType[ProductType["ConsoleGame"] = 1] = "ConsoleGame";
    ProductType[ProductType["PCGame"] = 2] = "PCGame";
    ProductType[ProductType["MusicCD"] = 3] = "MusicCD";
    ProductType[ProductType["DVD"] = 4] = "DVD";
    ProductType[ProductType["BlueRayDisc"] = 5] = "BlueRayDisc";
    ProductType[ProductType["Book"] = 6] = "Book";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
class ProductItem {
    constructor(name = "", type = ProductType.Unset, itemId = -1, price = -1) {
        this.name = name;
        this.type = type;
        this.itemId = itemId;
        this.price = price;
    }
}
exports.ProductItem = ProductItem;
class PriceEngine {
    constructor() {
    }
}
exports.PriceEngine = PriceEngine;
let engine = new PriceEngine();
