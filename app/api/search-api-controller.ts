/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Logger }                 from "@cli/cli.logger";
import { Express, Router}         from "express";
import { Request, Response }      from 'express';
import { Settings }               from "@app/zappy.app.settings";
import { ProductDb }              from "@db/product-db";
import { BarcodeParser }          from "@zaplib/barcode-parser";
import { IApiController }         from "@api/api-controller";
import { SearchResult }           from "@models/search-result";
import { ControllerUtils }        from "@api/controller.utils";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { CliCommander }           from "@cli/cli.commander";

export class SearchApiController implements IApiController {
	debug: boolean;
	webRoutes: Router;
	searchEngine: PriceSearchService;
	productDb: ProductDb;

	constructor() {
		this.productDb = new ProductDb();
		this.searchEngine = new PriceSearchService();
	}

	public initRoutes(routes: Router) {
		console.log("Init Search API Routes!!")

		this.webRoutes = routes;
		let scope = this;

		//
		// Get Product by Barcode
		//
		let extendedProdData = true;

		routes.post("/code2", (req, resp) => {
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
					resp.json(result);
				} else {
					resp.json(new Error("Not found"));
				}


			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});

		this.webRoutes.post("/code", (req, resp) => {
			console.log("I AM HERE!!!!");
			let data = req.body;

			let reqCode = data.code;
			let fullResult = !data.cache;
			let debug = data.debug;

			Logger.logGreen("Given Barcode:", data);
			reqCode = BarcodeParser.prepEan13Code(reqCode, true);
			Logger.logGreen("Prepared Barcode:", reqCode);

			scope.callSearchService(reqCode).then((searchRes) => {
				console.log("SEARCH RESULT ::", searchRes);
			}).catch((err) => {
				ControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});

		this.webRoutes.get('/code/:code', this.doDebugSearch.bind(this));
	}

	public doDebugSearch(req: Request, resp: Response) {
		let code = "819338020068";

		this.callSearchService(code).then((searchRes) => {
			console.log("SEARCH RESULT ::", searchRes);
		}).catch((err) => {
			ControllerUtils.internalError(resp);
			Logger.logError("SearchApiController :: error ::", err);
		})
	}

	public callSearchService(code: string): Promise<SearchResult> {
		return new Promise((resolve, reject) => {
			let url = Settings.PriceServiceApi.Endpoint;
			this.searchEngine.doSearch(code).then((searchResult) => {

			}).catch((err) => {

			})
		});
	}


	/**
	 *
	 * @param {string} barcode
	 * @returns {Promise<SearchResult>}
	 *
	public getFromDatabase(barcode: string): Promise<SearchResult> {
		let fullResult =
		return new Promise((resolve, reject) => {
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
	}*/
}

if (CliCommander.debug()) {
	let app = new SearchApiController();
	app.doDebugSearch(null, null);
}
