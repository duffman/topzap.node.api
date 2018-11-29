export enum ZapType {
	typeUnknown = -1,
	typeZapData = 100,
	typeZapResult = 101,
	typeZapBasket = 102,
	typeZapVendorList = 103,
	typeZapOffer = 104
}

export interface IZapData {
	type: ZapType;
	name: string;
}
export interface IZapResult extends IZapData {
}

export interface IZapBasket extends IZapData {
}

export interface IZapVendorList extends IZapData {
}

export interface IZapOffer extends IZapData {
}

export interface IZapBasket extends IZapData {
}

export interface IZapVendorList extends IZapData {
}

/*
function zapInstance(obj: any, objType: ): boolean {
	let result: IZapData = null;

	if ((obj as objType) !== null) {
		result = true;
	}

	return result;
}
*/

function instanceOfZap(obj: any): ZapType {
	let result = ZapType.typeUnknown;

	if ((obj as IZapData) === null) {
		return ZapType.typeZapData;
	}

	if (((obj as IZapResult) !== null) && ((obj as IZapResult).type === ZapType.typeZapResult)) {
		result = ZapType.typeZapResult;
	} else

	if (((obj as IZapBasket) !== null) && ((obj as IZapBasket).type === ZapType.typeZapBasket)) {
		result = ZapType.typeZapBasket;
	} else

	if (((obj as IZapVendorList) !== null) && ((obj as IZapVendorList).type === ZapType.typeZapVendorList)) {
		result = ZapType.typeZapVendorList;
	} else

	if (((obj as IZapOffer) !== null) && ((obj as IZapOffer).type === ZapType.typeZapData)) {
		result = ZapType.typeZapOffer;
	}

	return result;
}

function zapTypeToString(typeZ: ZapType): string {
	let result = "";

	switch (typeZ) {
		case ZapType.typeUnknown:
				result = "Unknown";
			break;
		case ZapType.typeZapData:
			result = "ZapData";
			break;
		case ZapType.typeZapResult:
			result = "ZapResult";
			break;
		case ZapType.typeZapBasket:
			result = "ZapBasket";
			break;
		case ZapType.typeZapVendorList:
			result = "ZapVendorList";
			break;
		case ZapType.typeZapOffer:
			result = "ZapOffer";
			break;
	}

	return result;
}

function isVendorList(obj: any): boolean {
	return instanceOfZap(obj) === ZapType.typeZapVendorList;
}
function isBasket(obj: any): boolean {
	return instanceOfZap(obj) === ZapType.typeZapBasket;
}

/******************************************************
******************************************************/

let obj1: IZapData = {
	type: ZapType.typeZapOffer,
	name: "Offer"
};

let obj2: IZapBasket = {
	type: ZapType.typeZapBasket,
	name: "Kalle"
};

// Classes

export class Vendors implements IZapVendorList {
	type = ZapType.typeZapVendorList;
	name: string = "Vendor List";

}
export class ZapBasket implements IZapBasket{
	type = ZapType.typeZapBasket;
	name: string = "Fat Basket";
}

export class ZapResult implements IZapResult{
	type = ZapType.typeZapResult;
	name: string = "Zap Result";
}

export class ZapOffer implements IZapOffer{
	type = ZapType.typeZapOffer;
	name: string = "Zap Offers";
}

function checkType(obj: any): ZapType {
	if ("zapType" in obj) {}

	return null;
}

let objVendors = new Vendors();

console.log("objVendors ::", objVendors);

let objResult = new ZapResult();
let objZapOffer = new ZapOffer();
let objZapBasket = new ZapBasket();

console.log("isVendor ::", instanceOfZap(objVendors) == ZapType.typeZapVendorList);
console.log("isZapOffer ::", instanceOfZap(objVendors) === ZapType.typeZapOffer);
