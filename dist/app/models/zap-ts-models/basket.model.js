'use strict';Object.defineProperty(exports,'__esModule',{value:true});class BasketModel{constructor(items=new Array()){this.items=items;}}exports.BasketModel=BasketModel;class VendorBasketModel extends BasketModel{constructor(vendorId){super();this.vendorId=vendorId;}}exports.VendorBasketModel=VendorBasketModel;