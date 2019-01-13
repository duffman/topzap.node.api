'use strict';Object.defineProperty(exports,'__esModule',{value:true});const analytics_db_1=require('../../../database/analytics-db');const zap_message_types_1=require('../../zap-ts-models/messages/zap-message-types');const cli_logger_1=require('../../cli/cli.logger');class AnalyticsWsApiController{constructor(debugMode){this.debugMode=debugMode;this.analyticsDb=new analytics_db_1.AnalyticsDb();console.log('********* AnalyticsWsApiController');}attachServiceClient(client){this.serviceClient=client;this.serviceClient.onMessage(this.onServiceMessage.bind(this));}onServiceMessage(mess){let scope=this;}attachWSS(wss){this.wss=wss;this.wss.onMessage(mess=>{let sessId=mess.socket.request.sessionID;if(mess.id===zap_message_types_1.ZapMessageType.BasketAdd){console.log('********* AnalyticsWsApiController :: ZapMessageType.BasketAdd');this.onBasketAdd(sessId,mess);}});}onBasketAdd(sessId,mess){cli_logger_1.Logger.logGreen('AnalyticsWsApiController :: onBasketAdd');let code=mess.data.code;this.analyticsDb.doZap(code).then(res=>{cli_logger_1.Logger.logGreen('AnalyticsWsApiController :: onBasketAdd :: doZap ::',res);}).catch(err=>{cli_logger_1.Logger.logGreen('AnalyticsWsApiController :: onBasketAdd :: err ::',err);});}initRoutes(routes){}}exports.AnalyticsWsApiController=AnalyticsWsApiController;