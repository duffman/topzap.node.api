'use strict';Object.defineProperty(exports,'__esModule',{value:true});const cli_logger_1=require('../../cli/cli.logger');class BasketUtils{static showBasket(basket,includeVendorData=true){cli_logger_1.Logger.logPurple('## showBasket ##');if(!basket.data){cli_logger_1.Logger.logYellow('showBasket :: Vendor Baskets is NULL');return;}for(const vBasket of basket.data){let vendorBasket=vBasket;if(!vendorBasket){cli_logger_1.Logger.logYellow('showBasket :: The Baskets is NULL');continue;}cli_logger_1.Logger.logYellow('showBasket :: vendorId ::',vendorBasket.vendorId);if(includeVendorData){if(vendorBasket.vendorData){cli_logger_1.Logger.logYellow('showBasket :: vendorBasket.vendorData ::',JSON.stringify(vendorBasket.vendorData));cli_logger_1.Logger.logYellow('showBasket :: id',vendorBasket.vendorData.id?vendorBasket.vendorData.id:'vendorBasket.vendorData.id = undefined');cli_logger_1.Logger.logYellow('showBasket :: identifier',vendorBasket.vendorData.identifier?vendorBasket.vendorData.identifier:'vendorBasket.vendorData.identifier = undefined');cli_logger_1.Logger.logYellow('showBasket :: vendorType',vendorBasket.vendorData.vendorType?vendorBasket.vendorData.vendorType:'vendorBasket.vendorData.vendorType = undefined');cli_logger_1.Logger.logYellow('showBasket :: name',vendorBasket.vendorData.name?vendorBasket.vendorData.name:'vendorBasket.vendorData.name = undefined');}else{cli_logger_1.Logger.logError('vendorBasket.vendorData :: MISSING');}}if(!vendorBasket.items){cli_logger_1.Logger.logYellow('showBasket :: The Baskets HAVE NO ITEMS');continue;}for(const basket of vendorBasket.items){cli_logger_1.Logger.logPurple('showBasket :: ITEM :: basket.vendorId ::',basket.vendorId?basket.vendorId:'basket.vendorId = undefined');cli_logger_1.Logger.logPurple('showBasket :: ITEM :: basket.code ::',basket.code?basket.code:'basket.code = undefined');cli_logger_1.Logger.logPurple('showBasket :: ITEM :: basket.offer ::',basket.offer?basket.offer:'basket.offer = undefined');cli_logger_1.Logger.logPurple('showBasket :: ITEM :: basket.title ::',basket.title?basket.title:'basket.title = undefined');cli_logger_1.Logger.logPurple('showBasket :: ITEM :: basket.thumbImage ::',basket.thumbImage?basket.thumbImage:'basket.thumbImage = undefined');}}}}exports.BasketUtils=BasketUtils;