'use strict';Object.defineProperty(exports,'__esModule',{value:true});const io=require('socket.io-client');const socket_io_types_1=require('./socket-io.types');const events_1=require('events');const igniter_event_types_1=require('./igniter-event.types');const message_factory_1=require('../messaging/message-factory');const igniter_settings_1=require('../igniter.settings');const message_utils_1=require('../messaging/message-utils');class PromiseAwaitInfo{constructor(tag,resolver=null,rejecter=null,promise=null){this.tag=tag;this.resolver=resolver;this.rejecter=rejecter;this.promise=promise;}}exports.PromiseAwaitInfo=PromiseAwaitInfo;class IgniterClientSocket{constructor(){this.eventEmitter=new events_1.EventEmitter();this.awaitStack=new Array();}findAwaitByTag(tag){let result=null;for(const item of this.awaitStack){if(item.tag===tag){result=item;break;}}return result;}awaitMessage(message){if(this.findAwaitByTag(message.tag)!==null){return null;}let awaiter=new PromiseAwaitInfo(message.tag);awaiter.promise=new Promise((resolve,reject)=>{awaiter.resolver=resolve;awaiter.rejecter=reject;});this.awaitStack.push(awaiter);return awaiter.promise;}parseIncomingMessage(data){console.log('PARSE INCOMING MESSAGE ::',data);let awaitInfo=this.findAwaitByTag(data.tag);if(awaitInfo!==null){awaitInfo.resolver(data);}else{this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewMessage,data);}}connect(url=null){console.log('Doing Client Connect ::');if(url===null){url='http://localhost:'+igniter_settings_1.IgniterSettings.DefSocketServerPort;}console.log('Connecting...');let options={reconnection:true};this.socket=io.connect(url,options);this.assignEventHandlers(this.socket);}sendMessage(messageType,id,data){let message=message_factory_1.MessageFactory.newIgniterMessage(messageType,id,data);console.log('Sending Message ::',message);this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE,message);return this.awaitMessage(message);}emitMessageRaw(data){console.log('emitMessageRaw ::',data);this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE,data);}assignEventHandlers(client){client.on(socket_io_types_1.IOTypes.SOCKET_IO_CONNECT,this.socketConnect.bind(this));client.on(socket_io_types_1.IOTypes.SOCKET_IO_DISCONNECT,this.socketDisconnect.bind(this));client.on(socket_io_types_1.IOTypes.SOCKET_IO_EVENT,this.socketEvent.bind(this));client.on(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE,this.socketMessage.bind(this));}socketConnect(){this.eventEmitter.emit(igniter_event_types_1.SocketEvents.SocketConnect);}socketDisconnect(data){console.log('ON DISCONNECT!');this.eventEmitter.emit(igniter_event_types_1.SocketEvents.SocketDisconnect);}socketEvent(data){console.log('ON EVENT!');this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewEvent,data);}socketMessage(dataObj){if(message_utils_1.MessageUtils.validateMessageType(dataObj)===false){let errMessage='Invalid Message Type, does not conform to IgniterMessage';this.eventEmitter.emit(igniter_event_types_1.SocketEvents.Error,errMessage,dataObj);return;}this.parseIncomingMessage(dataObj);}onConnect(listener){this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketConnect,listener);}onDisconnect(listener){this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketClosed,listener);}onEvent(listener){this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewEvent,listener);}onMessage(listener){this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewMessage,listener);}onError(listener){this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.Error,listener);}}exports.IgniterClientSocket=IgniterClientSocket;