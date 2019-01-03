/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { VendorModel } from "@zapModels/vendor-model";

export class VendorList {
	list = Array<VendorModel>();

	constructor() {}

	public addVendor(vendor: VendorModel) {
		this.list.push(vendor);
	}
}
