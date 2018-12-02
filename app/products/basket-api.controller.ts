/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import * as session               from "express-session";
import { Request }                from "express";
import { Response }               from "express";
import { NextFunction }           from "express";
import { Router }                 from "express";
import { Logger }                 from "@cli/cli.logger";
import { IApiController }         from "@api/api-controller";
import { IBasketItem }            from "@app/zap-ts-models/basket-item.model";
import { BasketItem }             from "@app/zap-ts-models/basket-item.model";
import { IBasketModel }           from "@app/zap-ts-models/basket.model";
import { IVendorBasket }          from "@app/zap-ts-models/basket.model";
import { VendorBasketModel }      from "@app/zap-ts-models/basket.model";
import { IVendorData }            from "@app/zap-ts-models/zap-offer.model";
import { ZapOfferResult }         from "@app/zap-ts-models/zap-offer.model";
import { IZapOfferResult }        from "@app/zap-ts-models/zap-offer.model";
import { IBasketAddResult }       from "@app/zap-ts-models/basket-add-result";
import { BasketAddResult }        from "@app/zap-ts-models/basket-add-result";
import { ISessionBasket }         from "@app/zap-ts-models/basket-collection";
import { SessionBasket }          from "@app/zap-ts-models/basket-collection";
import { ZapBasketData }          from "@zapModels/zap-basket.model";
import { IPriceSearchService }    from "@core/price-search-engine/price.search-service";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { Settings }               from "@app/zappy.app.settings";
import { ApiControllerUtils }     from "@api/controller.utils";
import { ProductApiController }   from '@api/product-api.controller';
import { IProductData }           from '@zapModels/product.model';

export class BasketApiController implements IApiController{
	productApiController: ProductApiController;
	searchService: IPriceSearchService;
	sessionBasket: ISessionBasket;
	reqSession: any;

	constructor() {
		this.searchService = new PriceSearchService();
	}

	private echoDebug() {
		for (let i = 0; i < this.sessionBasket.data.length; i++) {
			let basket = this.sessionBasket.data[i];
			console.log("Vendor :: " + basket.vendorId, basket.items);
		}
	}

	private getSessionBasket(): ISessionBasket {
		if (this.reqSession.sessionBasket) {
			this.sessionBasket = this.reqSession.sessionBasket as ISessionBasket;
			console.log("SESSION BASKET ::", this.sessionBasket);

		} else {
			this.reqSession.sessionBasket = new SessionBasket();
			this.sessionBasket = this.reqSession.sessionBasket;
		}

		return this.sessionBasket;
	}

	private setSessionBasket(): boolean {
		try {
			this.reqSession.sessionBasket = this.sessionBasket;

		} catch (err) {
			console.log("setSessionBasket :: err ::", err);
			return false;
		}

		return true;
	}

	private getHighestBidder(offerData: IZapOfferResult): IVendorData {
		let highVendor: IVendorData = null;

		for (let i = 0; i < offerData.vendors.length; i++) {
			let vendor = offerData.vendors[i];

			if (!vendor.accepted) {
				console.log("NOT ACCEPTED");
				continue;
			}

			if (highVendor === null) {
				highVendor = vendor;
			}

			let highOffer = parseFloat(highVendor.offer);
			let vendorOffer = parseFloat(vendor.offer);

			if (vendorOffer > highOffer) {
				highVendor = vendor;
			}
		}

		return highVendor;
	}

	public getVendorBasket(vendorId: number): IBasketModel {
		let result: IVendorBasket = null;

		for (let i = 0; i < this.sessionBasket.data.length; i++) {
			let basket = this.sessionBasket.data[i];
			if (basket.vendorId === vendorId) {
				result = basket;
				break;
			}
		}

		if (result === null) {
			result = new VendorBasketModel(vendorId);
			this.sessionBasket.data.push(result);
		}

		return result;
	}

	/**
	 *  TODO: The amount (doubles) should be controlled by the miner
	 * @param {IBasketItem} item
	 * @returns {boolean}
	 */
	public addToVendorBasket(item: IBasketItem): boolean {
		let basket = this.getVendorBasket(item.vendorId);
		let existingItem = basket.items.find(o => o.code === item.code);

		if (typeof existingItem === "object") {
			existingItem.count++;
		} else {
			basket.items.push(item);
		}

		return true;
	}

	public addToBasket(code: string, offerData: IZapOfferResult): IBasketAddResult {
		let scope = this;
		let vendorBaskets = this.getSessionBasket();
		let highVendor: IVendorData = null;
		let highBidItem: IBasketItem = null;

		for (let i = 0; i < offerData.vendors.length; i++) {
			let vendor = offerData.vendors[i];

			if (!vendor.accepted) {
				console.log("NOT ACCEPTED");
				continue;
			}

			let vendorOffer = parseFloat(vendor.offer);

			let resultItem = new BasketItem(
				code,
				vendor.vendorId,
				vendor.title,
				vendorOffer
			);

			this.addToVendorBasket(resultItem);

			if (highVendor === null) {
				highVendor = vendor;
				highBidItem = resultItem;
			}

			let highOffer = parseFloat(highVendor.offer);

			if (vendorOffer > highOffer) {
				highVendor = vendor;
				highBidItem = resultItem;
			}
		}

		console.log("1 ::");

		let bestBasket = this.getBestBasket();

		console.log("2 ::");

		let addResult = new BasketAddResult(highBidItem !== null, highBidItem, bestBasket);

		console.log("3 ::");

		this.setSessionBasket();

		console.log("BASKETS ::", this.sessionBasket);
		this.echoDebug();

		return addResult;
	}

	/**
	 * Returns the total basket value
	 * @param {IBasketModel} basket
	 */
	public getBasketTotal(basket: IBasketModel): number {
		let total = 0;

		for (let index in basket.items) {
			let item = basket.items[index];
			total = total + item.offer;
		}

		return total;
	}

	public getBestBasket(): IBasketModel {
		let vendorBaskets = this.getSessionBasket();
		let bestTotal: number = 0;
		let bestBaset: IBasketModel = null;

		console.log("getBestBasket ::", bestBaset);

		for (let index in vendorBaskets.data) {
			let basket = vendorBaskets.data[index];
			let total = this.getBasketTotal(basket);

			if (total > bestTotal) {
				bestTotal = total;
				bestBaset = basket;
			}
		}

		return bestBaset;
	}

	/**
	 * Add product info to the session basket
	 * TODO: Fucking fuck in the fuck suck donkey ass, doing this makes me responsible for the
	 * TODO: product info life cycle, in othere fucking suck words, if the item is deleted so shall the info...
	 * @param {string} reqCode
	 * @param {IBasketAddResult} basketResult
	 */
	private addProductInfoToSession(code: string): Promise<boolean> {
		let scope = this;

		let sessionBasket = this.getSessionBasket();

		console.log("%%%%% ::: sessionBasket :::", sessionBasket);

		let data = sessionBasket.productData;

		console.log("%%%%% ::: sessionBasket.productData :::", sessionBasket.productData);

		if (!data) {
			scope.sessionBasket.productData = new Array<IProductData>();
			scope.setSessionBasket();
		}

		function haveProductData(code: string): boolean {
			for (let index in data) {
				let prod = data[index];
				if (prod.code === code) {
					return true;
				}
			}
			return false;
		}

		return new Promise((resolve, reject) => {
			if (haveProductData(code)) {
				resolve(true);
			} else {
				let prodApi = new ProductApiController();
				return prodApi.getProduct(code).then(res => {
					scope.sessionBasket.productData.push(res);
					scope.setSessionBasket();
					resolve(true);
				}).catch(err => {
					resolve(false);
				});
			}
		});
	}

	/**
	 * Add Product data to each item in the basket
	 */
	private prepareBasketItems(): Promise<boolean> {
		return new Promise((resolve, reject) => {
		});
	}

	private apiAddBasketItem(req: Request, resp: Response) {
		let scope = this;
		let result: IBasketAddResult;
		this.reqSession = req.session;

		let data = req.body;
		let code = data.code;

		console.log("%%%%% ::: Add TO BASKET");

		async function doAdd(): Promise<void> {
			let addRes = await scope.addProductInfoToSession(code);

			console.log("%%%%% ::: addRes :::", addRes);

			let searchResult = await scope.callSearchService(code);

			console.log("%%%%% ::: searchResult :::", searchResult);

			result = scope.addToBasket(code, searchResult);
			// Send the product data, it´s up to the client to render each item with product
			// result info, it was this or send prod data for each item, this produces a ligher
			// result but we have to manage the life cycle of the prod result, i.e no basket item with
			// the product code, drop the product...
			result.prodData = scope.sessionBasket.productData;

			console.log("%%%%% ::: scope.addToBasket ::", result);
			console.log("%%%%% ::: apiAddBasketItem ::", scope.sessionBasket);
		}

		doAdd().then(() => {
			resp.setHeader('Content-Type', 'application/json');

			console.log("%%%%% ::: Result ::", result);

			//let addResult = scope.addToBasket(code, searchRes);

			resp.json(result);

		}).catch(err => {
			ApiControllerUtils.internalError(resp);
			Logger.logError("SearchApiController :: error ::", err);
		});
	}

	/*
	private apiAddBasketItem(req: Request, resp: Response): Promise<void> {
		let scope = this;
		this.reqSession = req.session;

		let data = req.body;
		let reqCode = data.code;

		console.log("Add TO BASKET");

		this.callSearchService(reqCode).then((searchRes) => {
			resp.setHeader('Content-Type', 'application/json');

			let addResult = scope.addToBasket(reqCode, searchRes);

			resp.json(addResult);

		}).catch((err) => {
			ApiControllerUtils.internalError(resp);
			Logger.logError("SearchApiController :: error ::", err);
		});

		async function doAdd(): Promise<void> {

		}

		return new Promise((resolve, reject) => {
			doAdd().then(() => {resolve()});
		});
	}
	*/

	//this.reqSession = req.session;
	//let addResult = this.basketController.addToBasket(reqCode, searchRes);
	//resp.send(searchRes);
	//resp.json(addResult);



	private apiGetBasket(req: Request, resp: Response) {
		this.reqSession = req.session;

		let basketResult = new ZapBasketData();

		/*
		let bestBasket = this.getBestBasket(req);
		let basketTotal = this.getBasketTotal(bestBasket);
		*/

		// resp.setHeader('Content-Type', 'text/html')
		resp.setHeader('Content-Type', 'application/json');
		resp.write( JSON.stringify(basketResult));

	}


	public initRoutes(routes: Router) {
		routes.get("/basket", this.apiGetBasket.bind(this));
		routes.post("/basket/add", this.apiAddBasketItem.bind(this));
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
}
