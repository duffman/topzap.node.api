/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export interface IBasketItem {
	zid:      string;
	code:     string;
	vendorId: number;
	title:    string;
	offer:    number;
	count:    number;
}

export class BasketItem implements IBasketItem{
	constructor(public zid: string,
				public code: string,
				public vendorId: number,
				public title: string,
				public offer: number,
				public count: number = 1) {}
}
