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
import { IApiController }         from "@api/api-controller";
import { SearchResult }           from "@models/search-result";
import { ApiControllerUtils }        from "@api/controller.utils";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { CliCommander }           from "@cli/cli.commander";
import { IVendorData }            from "@app/zap-ts-models/zap-offer.model";
import { IZapOfferResult }        from "@app/zap-ts-models/zap-offer.model";
import { ZapOfferResult}          from "@app/zap-ts-models/zap-offer.model";
import { BasketApiController }    from "@app/products/basket-api.controller";

export class SearchApiController implements IApiController {
	debug: boolean;
	searchService: PriceSearchService;
	basketController: BasketApiController;
	productDb: ProductDb;

	constructor() {
		this.productDb = new ProductDb();
		this.searchService = new PriceSearchService();
	}

	public initRoutes(routes: Router): void {
		let scope = this;


		//
		// Get Product by Barcode
		//
		let extendedProdData = true;

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

			let fullResult = !data.cache;
			let debug = data.debug;

			console.log("Given Barcode:", data);
			//reqCode = BarcodeParser.prepEan13Code(reqCode, true);
			Logger.logGreen("Prepared Barcode:", reqCode);

			scope.callSearchService(reqCode).then((searchRes) => {
				resp.setHeader('Content-Type', 'application/json');

				//this.reqSession = req.session;
				//let addResult = this.basketController.addToBasket(reqCode, searchRes);
				//resp.send(searchRes);
				//resp.json(addResult);
				resp.json(
					{test: "kalle"}
					);

			}).catch((err) => {
				ApiControllerUtils.internalError(resp);
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
				resolve(searchRes);
			}).catch((err) => {
				ApiControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});
	}

	public callSearchService(code: string): Promise<IZapOfferResult> {
		Logger.logGreen("callSearchService");
		let url = Settings.PriceServiceApi.Endpoint;

		return new Promise((resolve, reject) => {
			return this.searchService.doDebugSearch(code).then((searchResult) => {
				console.log("callSearchService :: doSearch ::", searchResult);

				let result = ZapOfferResult.toZapRes(searchResult);
				resolve(result);

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
