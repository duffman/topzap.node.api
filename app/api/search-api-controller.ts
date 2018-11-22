/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Logger }                 from "@cli/logger";
import { Express, Router}         from "express";
import { ProductDb }              from "@db/product-db";
import { BarcodeParser }          from "@zaplib/barcode-parser";
import { IApiController }         from "@api/api-controller";

export class SearchApi implements IApiController {
	productDb: ProductDb;

	public setRouter(routes: Router) {
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

			Logger.logGreen("Given Barcode:", data);

			reqCode = BarcodeParser.prepEan13Code(reqCode, true);

			Logger.logGreen("Prepared Barcode:", reqCode);

			this.productDb.getProductOffers(reqCode, fullResult, extendedProdData, debug).then((result) => {
				if (result.product != null) {
					Logger.logGreen("Product found:", result.product.title);
					res.json(result);
				} else {
					res.json(new Error("Not found"));
				}


			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});

	}
}
