/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IBasketModel } from "@app/products/basket.model";
import { IBasketItem } from "@app/products/basket-item.model";

export interface IBasketAddResult {
	success: boolean;
	resultItem: IBasketItem;
	basketData: IBasketModel;
}

export class BasketAddResult implements IBasketAddResult {
	constructor(public success: boolean = false,
				public resultItem: IBasketItem = null,
				public basketData: IBasketModel = null) {}
}