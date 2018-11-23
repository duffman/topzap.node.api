"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const price_engine_1 = require("../price-engine");
class ProductGenerator {
    constructor() { }
    randomValue(min, max) {
        return Math.random() * (max - min) + min;
    }
    generateProcuts(minCount, maxCount, minPrice, maxPrice, types) {
        let result = new Array();
        let itemCount = this.randomValue(minCount, maxCount);
        for (let i = 0; i < itemCount - 1; i++) {
            let item = new price_engine_1.ProductItem();
            item.itemId = this.randomValue(100, 1000);
            item.price = this.randomValue(minPrice, maxPrice);
        }
        return result;
    }
}
exports.ProductGenerator = ProductGenerator;
