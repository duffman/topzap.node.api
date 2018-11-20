"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@cli/logger");
const barcode_parser_1 = require("@zaplib/barcode-parser");
class SearchApi {
    setRouter(routes) {
        let scope = this;
        //
        // Get Product by Barcode
        //
        let extendedProdData = true;
        routes.post('/barcode', (req, res) => {
            // /:code
            let data = req.body;
            let reqCode = data.ean; //  req.params.code;
            let fullResult = !data.cache;
            let debug = data.debug;
            logger_1.Logger.logGreen("Given Barcode:", data);
            reqCode = barcode_parser_1.BarcodeParser.prepEan13Code(reqCode, true);
            logger_1.Logger.logGreen("Prepared Barcode:", reqCode);
            this.productDb.getProductOffers(reqCode, fullResult, extendedProdData, debug).then((result) => {
                if (result.product != null) {
                    logger_1.Logger.logGreen("Product found:", result.product.title);
                    res.json(result);
                }
                else {
                    res.json(new Error("Not found"));
                }
            }).catch((error) => {
                logger_1.Logger.logError("Error in test", error);
            });
        });
    }
}
exports.SearchApi = SearchApi;
