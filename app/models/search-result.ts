/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { VendorList} from "@models/vendor-list";
import { ProductBidList } from "@models/product-bid-list";
import { VendorModel } from "@zapModels/vendor-model";
import { ProductBidModel } from "@models/product-bid-model";
import {IProductData, ProductData} from '@zapModels/product.model';

export class SearchResult {
	public success: boolean = true;
	public product: IProductData;
	public vendors: Array<VendorModel>;
	public bids: Array<ProductBidModel>;
	public errorMessage: string;

	constructor() {}

	public setProduct(product: IProductData) {
		this.product = product;
	}

	public setVendorList(vendors: VendorList) {
		//this.vendors = vendors;
	}

	public setBidList(bidList: ProductBidList) {
		//this.bidlist = bidList;
	}

	public setErrorMessage(message: string): void {
		this.success = false;
		this.errorMessage = message;
	}
}