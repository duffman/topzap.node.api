/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IBasketModel } from "@zapModels/basket.model";

export interface IBasketManager {
}

/**
 * Provides functionality to manage baskets and basket items
 */
export class BasketManager implements IBasketManager {
	constructor(basket: IBasketModel) {
	}

}
