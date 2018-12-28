'use strict';Object.defineProperty(exports,'__esModule',{value:true});const message_types_1=require('./message-types');const socket_io_types_1=require('../coldmind/socket-io.types');var IgniterMessageType;(function(IgniterMessageType){function toIgniterMessageType(json){return JSON.parse(json);}IgniterMessageType.toIgniterMessageType=toIgniterMessageType;function igniterMessageTypeToJson(value){return JSON.stringify(value);}IgniterMessageType.igniterMessageTypeToJson=igniterMessageTypeToJson;}(IgniterMessageType=exports.IgniterMessageType||(exports.IgniterMessageType={})));class IgniterMessage{constructor(type,id,data,tag=null){this.type=type;this.id=id;this.data=data;this.tag=tag;}is(type){return this.type===type;}idIs(id){return this.id===id;}reply(type,id,data=null){let igniterMessage=new IgniterMessage(type,id,data,this.tag);this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE,igniterMessage);console.log('Reply Message Done');}error(error){this.reply(message_types_1.MessageType.Error,'error',JSON.stringify(error));}}exports.IgniterMessage=IgniterMessage;