/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export interface IVendorOfferResult {
	success: boolean;
	vendorId: number;
	code: string;
	accepted: boolean;
	title: string;
	offer: string;
}

export class VendorOfferResult implements IVendorOfferResult {
	constructor(
		public success: boolean = false,
		public code: string = null,
		public vendorId: number = -1,
		public accepted: boolean = false,
		public title: string = null,
		public offer: string = null,
		public rawData: any = null
	) {}
}
