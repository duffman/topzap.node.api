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
import { ISessionPullResult }     from '@zapModels/session-pull-result';
import { SessionPullResult }      from '@zapModels/session-pull-result';
import { ApiRoutes }              from '@api/api-routes';
import { IApiController }         from "@api/api-controller";
import { IBasketItem }            from "@app/zap-ts-models/basket-item.model";
import { BasketItem }             from "@app/zap-ts-models/basket-item.model";
import { IBasketModel }           from "@app/zap-ts-models/basket.model";
import { IVendorBasket }          from "@app/zap-ts-models/basket.model";
import { VendorBasketModel }      from "@app/zap-ts-models/basket.model";
import { IVendorOfferData }       from "@app/zap-ts-models/zap-offer.model";
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
import { PRandNum }               from '@putte/prand-num';
import { PVarUtils }              from '@putte/pvar-utils';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';

export class BasketApiController implements IApiController {
	productApiController: ProductApiController;
	searchService: IPriceSearchService;
	sessionBasket: ISessionBasket;
	reqSession: any;

	constructor(public debugMode: boolean = false) {
		this.searchService = new PriceSearchService();
	}

	private echoDebug() {
		for (let i = 0; i < this.sessionBasket.data.length; i++) {
			let basket = this.sessionBasket.data[i];
			console.log("Vendor :: " + basket.vendorId, basket.items);
		}
	}

	private getSessionBasket(): ISessionBasket {
		try {
			if (this.reqSession.sessionBasket) {
				this.sessionBasket = this.reqSession.sessionBasket as ISessionBasket;
				console.log("SESSION BASKET ::", this.sessionBasket);

			} else {
				this.reqSession.sessionBasket = new SessionBasket();
				this.sessionBasket = this.reqSession.sessionBasket;
			}

			return this.sessionBasket;

		} catch (ex) {
			return null;
		}
	}

	private setSessionBasket(basket: ISessionBasket = null): boolean {
		let result = false;
		try {
			if (basket === null) {
				basket = this.sessionBasket;
			}

			this.reqSession.sessionBasket = basket; //this.sessionBasket;
			result = true;

		} catch (err) {
			console.log("setSessionBasket :: err ::", err);
			result = false;
		}

		return result;
	}

	private validateSessionBasket(sessionBasket: ISessionBasket = null): boolean {
		let result = false;
		let basketSess = this.getSessionBasket();

		result = basketSess !== null && (basketSess instanceof SessionBasket);

		return result;
	}

	/**
	 * Create a bew session basket and stores it to the
	 * persistent session.
	 * @param {boolean} preserveExisting - do not overwrite existing session basket
	 * @returns {boolean}
	 */
	private initSessionBasket(keepExisting: boolean): boolean {
		let result = false;
//		let haveExisintg = keepExisting && getSessionBasket()

		try {

		} catch (err) {
			console.log("setSessionBasket :: err ::", err);
			result = false;
		}

		return result;
	}

	private getHighestBidder(offerData: IZapOfferResult): IVendorOfferData {
		let highVendor: IVendorOfferData = null;

		offerData.vendors = PVarUtils.isNullOrUndefined(offerData.vendors)
			? new Array<IVendorOfferData>() : offerData.vendors;

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
		let highVendor: IVendorOfferData = null;
		let highBidItem: IBasketItem = null;

		for (let i = 0; i < offerData.vendors.length; i++) {
			let vendor = offerData.vendors[i];

			if (!vendor.accepted) {
				console.log("NOT ACCEPTED");
				continue;
			}

			let vendorOffer = parseFloat(vendor.offer);

			let resultItem = new BasketItem(
				PRandNum.randomNum(),
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

	private findItemByZid() {
	}

	private apiDeleteBasketItem(req: Request, resp: Response): void {
		let data = req.body;
		let code = data.code;
		let basket = this.getSessionBasket();

		let prodIdx = basket.productData.indexOf(basket.productData.find(i => i.code === code));

		// Remove cached product data
		if (PVarUtils.isNumber(prodIdx)) {
			basket.productData.splice(prodIdx, 1);
		}

		// Remove basked item in all vendor baskets
		for (let vendorBasket of basket.data) {
			let itemIdx = vendorBasket.items.indexOf(vendorBasket.items.find(i => i.code === code));
			if (PVarUtils.isNumber(itemIdx)) {
				vendorBasket.items.splice(itemIdx, 1);

				// If this was the last item, let´s remove the vendor basket from the
				// data array of Session vendor baskets
				if (vendorBasket.items.length === 0) {
					vendorBasket = null;
				}
			}
		}

		// Remove all vendor basket that contais no items...
		basket.data = basket.data.filter((vendorBasket: IVendorBasket) => {
			return vendorBasket !== null && vendorBasket.items.length > 0;
		});

		this.setSessionBasket(basket);

		// Call the get session basket in order to return
		// the current basket
		this.apiPullSession(req, resp);

		console.log("NEW BASKET :: DELETE ::", basket);
		console.log("DELETE ::", code);
	}

	private apiAddBasketItem(req: Request, resp: Response): void {
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

			console.log("%%%%% ::: scope.sessionBasket.productData ::", scope.sessionBasket.productData);
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

	private apiGetBasket(req: Request, resp: Response) {
		this.reqSession = req.session;

		let basketResult = new ZapBasketData();

		/*
		let bestBasket = this.getBestBasket(req);
		let basketTotal = this.getBasketTotal(bestBasket);
		*/

		// resp.setHeader('Content-Type', 'text/html')
		resp.setHeader('Content-Type', 'application/json');
		resp.end(JSON.stringify(basketResult));
	}

	/**
	 * Returns the full basket session containing all vendors
	 * @param {Request} req
	 * @param {e.Response} resp
	 */
	private apiBasketReview(req: Request, resp: Response, next: NextFunction) {
		try {
			let sessionPullResult: ISessionPullResult = new SessionPullResult(true);
			let sessionBasket: ISessionBasket = this.getSessionBasket();

			sessionPullResult.data = sessionBasket.data;
			sessionPullResult.productData = sessionBasket.productData;

			resp.setHeader('Content-Type', 'application/json');
			resp.end(JSON.stringify(sessionPullResult));

		} catch (err) {
			Logger.logError("apiBasketReview ::", err);
			next(err);
		}
	}

	private apiClearBasket(req: Request, resp: Response, next: NextFunction): void {
		try {

		}
		catch(ex) {
			Logger.logError("pullSessionBasket :: error ::", ex);
		}
	}

	/**
	 * Returns the stores session basket, this method is usually called by the
	 * client upon a reload...
	 *
	 * There´s some special trix here, we need to remove all vendors but the best
	 * bidding vendor (the best basket)
	 *
	 * @param {e.Request} req
	 * @param {e.Response} resp
	 */
	private apiPullSession(req: Request, resp: Response): void {
		resp.setHeader('Content-Type', 'application/json');
		resp.end( JSON.stringify(
			{
				kalle: "kula"
			}
		));
		return;

		try {
			let sessionBasket = this.getSessionBasket();

			console.log("¤ apiPullSession ::", sessionBasket);

			let bestBasket = this.getBestBasket();

			console.log("¤ bestBasket ::", bestBasket);

			// Emulate the add where we only send the best basket
			// We might get some unwanted product info if a lower bid basket have product that
			// the best basket don´t have, but what the hell...
			let sessionPullResult = new SessionPullResult(true);

			console.log("¤ sessionPullResult ::", sessionPullResult);

			try {
				let tmpSessionBasket = new SessionBasket();

				console.log("¤ 1 > tmpSessionBasket ::", tmpSessionBasket);

				tmpSessionBasket.productData = sessionBasket.productData;

				console.log("¤ 2 > tmpSessionBasket.productData ::", tmpSessionBasket.productData);

				let bestBasketResult = bestBasket as IVendorBasket;

				console.log("¤ 3 > bestBasketResult ::", bestBasketResult);

				if (bestBasketResult !== null) {
					console.log("¤ 3:a > bestBasketResult !== null");
					tmpSessionBasket.data.push(bestBasketResult);
				} else {
					console.log("¤ 3:b > bestBasketResult !== null");
				}

				sessionPullResult.productData = tmpSessionBasket.productData;
				sessionPullResult.data = tmpSessionBasket.data;

			} catch (err) {
				sessionPullResult.success = false;
			}

			resp.setHeader('Content-Type', 'application/json');
			resp.end( JSON.stringify(sessionPullResult));

		} catch (ex) {
			Logger.logError(`apiPullSession :: `, ex);
			ApiControllerUtils.bogusError(resp,"GraphQL Error: 478");
		}
	}

	public attachWSS(wss: ISocketServer): void {
	}

	public initRoutes(routes: Router): void  {
		routes.get(ApiRoutes.Basket.GET_BASKET,             this.apiGetBasket.bind(this));
		routes.post(ApiRoutes.Basket.POST_BASKET_ADD,       this.apiAddBasketItem.bind(this));
		routes.post(ApiRoutes.Basket.POST_BASKET_DELETE,    this.apiDeleteBasketItem.bind(this));
		routes.post(ApiRoutes.Basket.POST_BASKET_CLEAR,     this.apiClearBasket.bind(this));
		routes.post(ApiRoutes.Basket.POST_BASKET_REVIEW,    this.apiBasketReview.bind(this));
		routes.post(ApiRoutes.Basket.POST_BASKET_SESS_PULL, this.apiPullSession.bind(this));
	}

	public callSearchService(code: string): Promise<IZapOfferResult> {
		Logger.logGreen("callSearchService");

		let url = Settings.PriceServiceApi.Endpoint;

		return new Promise((resolve, reject) => {
//			return this.searchService.doDebugSearch(code).then((searchResult) => {
			return this.searchService.doPriceSearch(code).then((searchResult) => {
				console.log("callSearchService :: doSearch ::", searchResult);


				//let result = ZapOfferResult.toZapRes(searchResult);

				resolve(null);

			}).catch((err) => {
				console.log("callSearchService :: error ::", err);
				resolve(err);
			})
		});
	}
}