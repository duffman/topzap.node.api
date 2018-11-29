"use strict";
exports.__esModule = true;
var ZapType;
(function (ZapType) {
    ZapType[ZapType["typeUnknown"] = -1] = "typeUnknown";
    ZapType[ZapType["typeZapData"] = 100] = "typeZapData";
    ZapType[ZapType["typeZapResult"] = 101] = "typeZapResult";
    ZapType[ZapType["typeZapBasket"] = 102] = "typeZapBasket";
    ZapType[ZapType["typeZapVendorList"] = 103] = "typeZapVendorList";
    ZapType[ZapType["typeZapOffer"] = 104] = "typeZapOffer";
})(ZapType = exports.ZapType || (exports.ZapType = {}));
/*
function zapInstance(obj: any, objType: ): boolean {
    let result: IZapData = null;

    if ((obj as objType) !== null) {
        result = true;
    }

    return result;
}
*/
function instanceOfZap(obj) {
    var result = ZapType.typeUnknown;
    if (obj === null) {
        return ZapType.typeZapData;
    }
    if ((obj !== null) && (obj.type === ZapType.typeZapResult)) {
        result = ZapType.typeZapResult;
    }
    else if ((obj !== null) && (obj.type === ZapType.typeZapBasket)) {
        result = ZapType.typeZapBasket;
    }
    else if ((obj !== null) && (obj.type === ZapType.typeZapVendorList)) {
        result = ZapType.typeZapVendorList;
    }
    else if ((obj !== null) && (obj.type === ZapType.typeZapData)) {
        result = ZapType.typeZapOffer;
    }
    return result;
}
function zapTypeToString(typeZ) {
    var result = "";
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
function isVendorList(obj) {
    return instanceOfZap(obj) === ZapType.typeZapVendorList;
}
function isBasket(obj) {
    return instanceOfZap(obj) === ZapType.typeZapBasket;
}
/******************************************************
******************************************************/
var obj1 = {
    type: ZapType.typeZapOffer,
    name: "Offer"
};
var obj2 = {
    type: ZapType.typeZapBasket,
    name: "Kalle"
};
// Classes
var Vendors = /** @class */ (function () {
    function Vendors() {
        this.type = ZapType.typeZapVendorList;
        this.name = "Vendor List";
    }
    return Vendors;
}());
exports.Vendors = Vendors;
var ZapBasket = /** @class */ (function () {
    function ZapBasket() {
        this.type = ZapType.typeZapBasket;
        this.name = "Fat Basket";
    }
    return ZapBasket;
}());
exports.ZapBasket = ZapBasket;
var ZapResult = /** @class */ (function () {
    function ZapResult() {
        this.type = ZapType.typeZapResult;
        this.name = "Zap Result";
    }
    return ZapResult;
}());
exports.ZapResult = ZapResult;
var ZapOffer = /** @class */ (function () {
    function ZapOffer() {
        this.type = ZapType.typeZapOffer;
        this.name = "Zap Offers";
    }
    return ZapOffer;
}());
exports.ZapOffer = ZapOffer;
function checkType(obj) {
    if ("zapType" in obj) { }
    return null;
}
var objVendors = new Vendors();
console.log("objVendors ::", objVendors);
var objResult = new ZapResult();
var objZapOffer = new ZapOffer();
var objZapBasket = new ZapBasket();
console.log("isVendor ::", instanceOfZap(objVendors) == ZapType.typeZapVendorList);
console.log("isZapOffer ::", instanceOfZap(objVendors) === ZapType.typeZapOffer);
