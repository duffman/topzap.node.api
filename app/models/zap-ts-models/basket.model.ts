/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IBasketItem } from "./basket-item.model";

export interface IBasketModel {
	items: IBasketItem[];
}

export class BasketModel implements IBasketModel {
	constructor(public items = new Array<IBasketItem>()) {
	}
}

export interface IVendorBasket extends IBasketModel {
	vendorId: number;
}

export class VendorBasketModel extends BasketModel implements IBasketModel {
	constructor(public vendorId: number) {
		super();
	}
}
