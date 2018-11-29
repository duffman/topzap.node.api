/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export enum ZapDataType {
	typeResultType = 100,
	typeSearchResultType = 101,
	typeVendorList = 102,
	typeZapOffer = 103
}

export interface IZapData {
	zid: number;
	type: number;
	success: boolean;
	data: any;
}
