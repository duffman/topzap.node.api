'use strict';Object.defineProperty(exports,'__esModule',{value:true});const zap_message_types_1=require('../../zap-ts-models/messages/zap-message-types');const message_types_1=require('../../../lib/coldmind-igniter/messaging/message-types');const igniter_messages_1=require('../../../lib/coldmind-igniter/messaging/igniter-messages');class PriceOfferManager{constructor(serviceClient,wss){this.serviceClient=serviceClient;this.wss=wss;}emitGetOffersInit(sessId,data){let mess=new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action,zap_message_types_1.ZapMessageType.GetOffersInit,data,sessId);this.wss.sendToSessionId(sessId,mess);}emitVendorOffer(sessId,data){let mess=new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action,zap_message_types_1.ZapMessageType.VendorOffer,data,sessId);this.wss.sendToSessionId(sessId,mess);}emitOffersDone(sessId){let mess=new igniter_messages_1.ZynMessage(message_types_1.MessageType.Action,zap_message_types_1.ZapMessageType.GetOffersDone,{},sessId);this.wss.sendToSessionId(sessId,mess);}}exports.PriceOfferManager=PriceOfferManager;