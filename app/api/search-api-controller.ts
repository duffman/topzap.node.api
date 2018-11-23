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
	searchEngine: PriceSearchService;
	productDb: ProductDb;

	constructor() {
		this.productDb = new ProductDb();
		this.searchEngine = new PriceSearchService();
	}

	public initRoutes(routes: Router): void {
		let scope = this;

		//
		// Get Product by Barcode
		//
		let extendedProdData = true;

		routes.post("/code2BLABLA", (req, resp) => {
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

		//
		// Get Zap Result by GET barcode
		//
		routes.get("/codes", (req: Request, resp: Response) => {
			console.log("Fet fucking GET CODE");
			let reqCode = req.params.code;

			scope.callSearchService(reqCode).then((searchRes) => {
				console.log("JOKER :: SEARCH RESULT ::", searchRes);
			}).catch((err) => {
				ControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});

		//
		// Get Zap Result by POST barcode
		//
		routes.post("/code", (req: Request, resp: Response) => {
			console.log("CODE FROM NR 1 ::", req.body.code);
			Logger.spit();
			Logger.spit();
			console.log("REQUEST BODY ::", req.body);
			Logger.spit();
			Logger.spit();

			let data = req.body;
			let reqCode = data.code;

			console.log("FUCK MY ASS ::: ", reqCode);

			let fullResult = !data.cache;
			let debug = data.debug;

			console.log("Given Barcode:", data);
			//reqCode = BarcodeParser.prepEan13Code(reqCode, true);
			Logger.logGreen("Prepared Barcode:", reqCode);

			scope.callSearchService(reqCode).then((searchRes) => {
				console.log("RIDDLER :: SEARCH RESULT ::", searchRes);
				resp.json(searchRes);

			}).catch((err) => {
				ControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});

		routes.get('/code/:code', this.doDebugSearch.bind(this));
	}

	public doDebugSearch(req: Request, resp: Response) {
		console.log("SEARCH FUCKING DEBUG!!!");
		let code = "819338020068";

		return new Promise((resolve, reject) => {
			this.callSearchService(code).then((searchRes) => {
				console.log("BATMAN :: SEARCH RESULT ::", searchRes);
				resolve(searchRes);
			}).catch((err) => {
				ControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});
	}

	//	public callSearchService(code: string): Promise<SearchResult> {

	public callSearchService(code: string): Promise<string> {
		Logger.logGreen("callSearchService");
		let url = Settings.PriceServiceApi.Endpoint;

		return new Promise((resolve, reject) => {
			return this.searchEngine.doSearch(code).then((searchResult) => {
				console.log("callSearchService :: doSearch ::", searchResult);
				resolve(searchResult);

			}).catch((err) => {
				console.log("callSearchService :: error ::", err);
				resolve(err);
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
