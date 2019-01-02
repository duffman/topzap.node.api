/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IVendorBasket }          from "./basket.model";
import { IProductData }           from './product.model';

export interface ISessionBasket {
	productData: IProductData[]; // Stores in the session so we don´t need to access the Db for basket ecery request...
	data: IVendorBasket[];
}

export class SessionBasket implements ISessionBasket {
	productData: IProductData[];
	data: IVendorBasket[];

	constructor() {
		this.productData = new Array<IProductData>();
		this.data = new Array<IVendorBasket>();
	}
}