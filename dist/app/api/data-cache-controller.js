'use strict';Object.defineProperty(exports,'__esModule',{value:true});const cached_offers_db_1=require('../../database/cached-offers-db');const zap_message_types_1=require('../zap-ts-models/zap-message-types');class DataCacheController{constructor(debugMode=false){this.debugMode=debugMode;this.cachedOffersDb=new cached_offers_db_1.CachedOffersDb();}initRoutes(routes){}attachWSS(wss){this.wss=wss;}attachServiceClient(client){this.serviceClient=client;this.serviceClient.onMessage(this.onServiceMessage.bind(this));}onServiceMessage(mess){if(mess.id===zap_message_types_1.ZapMessageType.VendorOffer){this.cachedOffersDb.cacheOffer(mess.data);}}}exports.DataCacheController=DataCacheController;