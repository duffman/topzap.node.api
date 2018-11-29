/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IBasketItem } from "@app/products/basket-item.model";

export interface IBasketModel {
	vendorId: number;
	items: IBasketItem[];
}

export class BasketModel implements IBasketModel {
	items: IBasketItem[];

	constructor(public vendorId: number) {
		this.items = new Array<IBasketItem>();
	}
}
