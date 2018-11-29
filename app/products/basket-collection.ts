/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IBasketModel } from "@app/products/basket.model";
import { IBasketItem } from "@app/products/basket-item.model";

export interface IBasketCollection {
	data: IBasketModel[];
}

export class BasketCollection implements IBasketCollection {
	data: IBasketModel[];

	constructor() {
		this.data = new Array<IBasketModel>();
	}
}