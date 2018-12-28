/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Logger }                 from "@cli/cli.logger";
import { Express, Router}         from "express";
import { Request, Response }      from 'express';
import { Settings }               from "@app/zappy.app.settings";
import { IApiController }         from "@api/api-controller";
import { ApiControllerUtils }     from "@api/controller.utils";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { CliCommander }           from "@cli/cli.commander";
import { IZapOfferResult }        from "@app/zap-ts-models/zap-offer.model";
import { BasketApiController }    from "@app/components/basket/basket-api.controller";

export class SearchApiController implements IApiController {
	searchService: PriceSearchService;

	constructor(public debugMode: boolean = false) {
		this.searchService = new PriceSearchService();
	}

	public initRoutes(routes: Router): void {
		let scope = this;

		routes.get("/pt/:code", (req: Request, resp: Response) => {
			let code = req.params.code;

			console.log("Test Test ::", code);

			scope.searchService.doPriceSearch(code).then(res => {
				console.log("doPriceSearch -> resolved");
				resp.json(res);
			}).catch(err => {
				resp.json(new Error("Error looking up price!"));
			});
		});

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
				resp.send(searchRes);

				//this.reqSession = req.session;
				//let addResult = this.basketController.addToBasket(reqCode, searchRes);
				//resp.send(searchRes);

				/*/resp.json(addResult);
				resp.json({test: "kalle"});
				*/

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
			return this.searchService.doPriceSearch(code).then((searchResult) => {
				console.log("callSearchService :: doSearch ::", searchResult);

				// let result = ZapOfferResult.toZapRes(searchResult);

				resolve(null);

			}).catch((err) => {
				console.log("callSearchService :: error ::", err);
				resolve(err);
			})
		});
	}
}

if (CliCommander.debug()) {
	let app = new SearchApiController();
	//app.doDebugSearch(null, null);
}
