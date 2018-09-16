/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

export class ProductModel {
	constructor(
		public name: string = "",
		public barcode: string = "",
		public cover_url: string = ""
	) {}
}