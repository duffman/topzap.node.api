/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export interface IZapOfferResult {
	highOffer: number;
	vendors:   IVendorData[];
}

export interface IVendorData {
	vendorId: number;
	accepted: boolean;
	title:    string;
	offer:    string;
	rawData:  null;
}

// Converts JSON strings to/from your types
export namespace ZapOfferResult {
	export function toZapRes(json: string): IZapOfferResult {
		return JSON.parse(json);
	}

	export function zapResToJson(value: IZapOfferResult): string {
		return JSON.stringify(value);
	}
}
