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
import { IApiController }         from "@api/api-controller";
import {BasketItem, IBasketItem} from "@app/products/basket-item.model";
import { IBasketModel }           from "@app/products/basket.model";
import { BasketModel }            from "@app/products/basket.model";
import { IVendorData }            from "@app/zap-data-models/zap-offer.model";
import { IZapOfferResult }        from "@app/zap-data-models/zap-offer.model";
import { IBasketAddResult }       from "@app/zap-data-models/basket-add-result";
import { BasketAddResult }        from "@app/zap-data-models/basket-add-result";
import { IBasketCollection }      from "@app/products/basket-collection";
import { BasketCollection }       from "@app/products/basket-collection";
import {PStrUtils} from "@putte/pstr-utils";

export class BasketApiController implements IApiController{
	baskets: IBasketCollection;

	constructor() {}

	private echoDebug() {
		for (let i = 0; i < this.baskets.data.length; i++) {
			let basket = this.baskets.data[i];

			console.log("Vecndor :: " + basket.vendorId, basket.items);
		}
	}

	private getSessionBasket(req: Request): IBasketCollection {
		if (req.session.baskets) {
			this.baskets = req.session.baskets as IBasketCollection;
			console.log("SESSION BASKET ::", this.baskets);

		} else {
			req.session.baskets = new BasketCollection();
			this.baskets = req.session.baskets;
		}

		return this.baskets;
	}

	private setSessionBasket(req: Request): boolean {
		try {
			req.session.baskets = this.baskets;

		} catch (err) {
			console.log("setSessionBasket :: err ::", err);
			return false;
		}

		return true;
	}

	private getBasket(req: Request, resp: Response) {
		let basket = this.getSessionBasket(req);

		console.log("Get Basket ::", basket);

		resp.setHeader('Content-Type', 'application/json');
		resp.write( JSON.stringify(basket));


		/*
		if (req.session.basket) {
			req.session.basket.itemCount++
			resp.setHeader('Content-Type', 'text/html')
			resp.write('<p>views: ' + req.session.basket.itemCount + '</p>')
			resp.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
			resp.end()
		} else {
			req.session.basket = {
				type: "basket",
				itemCount: 0
			};
			resp.end('welcome to the session demo. refresh! :: ' + req.session.basket.itemCount);
		}

		*/

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
		let result: IBasketModel = null;

		for (let i = 0; i < this.baskets.data.length; i++) {
			let basket = this.baskets.data[i];
			if (basket.vendorId === vendorId) {
				result = basket;
				break;
			}
		}

		if (result === null) {
			result = new BasketModel(vendorId);
			this.baskets.data.push(result);
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

		if (existingItem === undefined) {
			existingItem.count++;
		} else {
			basket.items.push(item);
		}

		return true;
	}

	public addToBasket(req: Request, code: string, offerData: IZapOfferResult): IBasketAddResult {
		let scope = this;
		let vendorBaskets = this.getSessionBasket(req);
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

		let addResult = new BasketAddResult(highBidItem !== null, highBidItem);

		this.setSessionBasket(req);

		console.log("BASKETS ::", this.baskets);
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

	public getBestBasket(req: Request): IBasketModel {
		let basket: IBasketModel = null;
		let vendorBaskets = this.getSessionBasket(req);



		return basket;
	}


	public addToBasket2(req: Request, code: string, result: IZapOfferResult): IBasketAddResult {
		let scope = this;
		let baskets = this.getSessionBasket(req);
		let resultItem: IBasketItem = null;

		let higestBiddingVendor = scope.getHighestBidder(result);
		let success = higestBiddingVendor !== null;

		console.log("higestBiddingVendor ::", higestBiddingVendor);
		console.log("success ::", success);

		if (success) {
			resultItem = new BasketItem(
				code,
				higestBiddingVendor.vendorId,
				higestBiddingVendor.title,
		 		parseFloat(higestBiddingVendor.offer)
			);

			this.addToVendorBasket(resultItem);
		}

		let addResult = new BasketAddResult(success, resultItem);

		this.setSessionBasket(req);

		console.log("BASKETS ::", this.baskets);
		this.echoDebug();

		return addResult;
	}

	private addItem(req: Request, resp: Response) {

	}

	public initRoutes(routes: Router) {
		routes.get("/basket", this.getBasket.bind(this));
		routes.post("/basket", this.addItem.bind(this));
	}

}