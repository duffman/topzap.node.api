/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import {BasketItem, IBasketItem} from '@zapModels/basket-item.model';
import {IBasketModel, IVendorBasket, VendorBasketModel} from '@zapModels/basket.model';
import {BasketAddResult, IBasketAddResult} from '@zapModels/basket-add-result';
import {IVendorOfferData, IZapOfferResult} from '@zapModels/zap-offer.model';
import {ISessionBasket, SessionBasket} from '@zapModels/basket-collection';
import {SessionManager} from '@components/session-manager';
import {PRandNum} from '@putte/prand-num';

export class BasketHandler {
	constructor(public sessManager: SessionManager) {}

	public getSessionBasket(sessId: string): ISessionBasket {
		return this.sessManager.getSessionBasket(sessId);
	}

	public addToBasket(sessId: string, offerData: IVendorOfferData): boolean {
		let scope = this;
		let sessBasket = this.getSessionBasket(sessId);

		if (!offerData.accepted) {
			console.log("NOT ACCEPTED");
			return false;
		}

		let vendorOffer = parseFloat(offerData.offer);

		let resultItem = new BasketItem(
			PRandNum.randomNum(),
			offerData.code,
			offerData.vendorId,
			offerData.title,
			vendorOffer
		);

		return this.addToVendorBasket(sessId, resultItem);
	}

	public addToVendorBasket(sessId: string, item: IBasketItem): boolean {
		let basket = this.getVendorBasket(sessId, item.vendorId);
		let existingItem = basket.items.find(o => o.code === item.code);

		if (typeof existingItem === "object") {
			existingItem.count++;
		} else {
			basket.items.push(item);
		}

		return true;
	}

	public getVendorBasket(sessId: string, vendorId: number): IBasketModel {
		let result: IVendorBasket = null;
		let sessBasket = this.getSessionBasket(sessId);

		for (let i = 0; i < sessBasket.data.length; i++) {
			let basket = sessBasket.data[i];
			if (basket.vendorId === vendorId) {
				result = basket;
				break;
			}
		}

		if (result === null) {
			result = new VendorBasketModel(vendorId);
			sessBasket.data.push(result);
		}

		return result;
	}

	public getBasketTotal(basket: IBasketModel): number {
		let total = 0;

		for (let index in basket.items) {
			let item = basket.items[index];
			total = total + item.offer;
		}

		return total;
	}

	public getBestBasket(sessId: string): IBasketModel {
		let vendorBaskets = this.getSessionBasket(sessId);
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

	public getFullBasket(sessId: string): ISessionBasket {
		let sessBasket = this.getSessionBasket(sessId);
		console.log("getFullBasket :: sessBasket ::", sessBasket);
		return sessBasket;
	}

	public showBasket(sessId: string): void {
		let basket = this.sessManager.getSessionBasket(sessId);

		for (const vendorData of basket.data) {
			console.log("BASKET :: VENDOR ::", vendorData.vendorId);

			for (const item of vendorData.items) {
				console.log("  ITEM ::", item);
			}
		}
	}
}
