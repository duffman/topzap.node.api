"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const socket_io_types_1 = require("./socket-io.types");
const events_1 = require("events");
const igniter_event_types_1 = require("./igniter-event.types");
const message_factory_1 = require("@igniter/messaging/message-factory");
const igniter_settings_1 = require("@igniter/igniter.settings");
const message_utils_1 = require("@igniter/messaging/message-utils");
class PromiseAwaitInfo {
    constructor(tag, resolver = null, rejecter = null, promise = null) {
        this.tag = tag;
        this.resolver = resolver;
        this.rejecter = rejecter;
        this.promise = promise;
    }
}
exports.PromiseAwaitInfo = PromiseAwaitInfo;
class ClientSocket {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
        this.awaitStack = new Array();
    }
    findAwaitByTag(tag, removeEntry = true) {
        let result = null;
        //for (const item of this.awaitStack) {
        for (let i = 0; i < this.awaitStack.length; i++) {
            let item = this.awaitStack[i];
            if (item.tag === tag) {
                if (removeEntry) {
                    this.awaitStack.slice(i, 1);
                    console.log('Slice Remove promise from awaitStack');
                }
                result = item;
                break;
            }
        }
        return result;
    }
    awaitMessage(message) {
        if (this.findAwaitByTag(message.tag) !== null) {
            return null;
        }
        let awaiter = new PromiseAwaitInfo(message.tag);
        awaiter.promise = new Promise((resolve, reject) => {
            awaiter.resolver = resolve;
            awaiter.rejecter = reject;
        });
        this.awaitStack.push(awaiter);
        return awaiter.promise;
    }
    parseIncomingMessage(data) {
        console.log("PARSE INCOMING MESSAGE ::", data);
        let awaitInfo = this.findAwaitByTag(data.tag);
        if (awaitInfo !== null) {
            awaitInfo.resolver(data);
        }
        else { // No awaiting promise, simply pass it on...
            this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewMessage, data);
        }
    }
    // -- //
    connect(url = null) {
        console.log("Doing Client Connect ::");
        if (url === null) {
            url = "http://localhost:" + igniter_settings_1.IgniterSettings.DefSocketServerPort;
        }
        console.log("Connecting...");
        let options = {
            reconnection: true,
        };
        this.socket = io.connect(url, options);
        this.assignEventHandlers(this.socket);
    }
    sendMessage(messageType, id, data, tag = null) {
        let message = message_factory_1.MessageFactory.newIgniterMessage(messageType, id, data, tag);
        console.log("Sending Message ::", message);
        this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, message);
        return message;
    }
    sendAwaitMessage(messageType, id, data, tag = null) {
        let message = this.sendMessage(messageType, id, data, tag);
        return this.awaitMessage(message);
    }
    emitMessageRaw(data) {
        console.log("emitMessageRaw ::", data);
        this.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, data);
    }
    assignEventHandlers(client) {
        client.on(socket_io_types_1.IOTypes.SOCKET_IO_CONNECT, this.socketConnect.bind(this));
        client.on(socket_io_types_1.IOTypes.SOCKET_IO_DISCONNECT, this.socketDisconnect.bind(this));
        client.on(socket_io_types_1.IOTypes.SOCKET_IO_EVENT, this.socketEvent.bind(this));
        client.on(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, this.socketMessage.bind(this));
    }
    socketConnect() {
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.SocketConnect);
    }
    socketDisconnect(data) {
        console.log("ON DISCONNECT!");
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.SocketDisconnect);
    }
    socketEvent(data) {
        console.log("ON EVENT!");
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewEvent, data);
    }
    socketMessage(dataObj) {
        if (message_utils_1.MessageUtils.validateMessageType(dataObj) === false) {
            let errMessage = "Invalid Message Type, does not conform to ZynMessage";
            this.eventEmitter.emit(igniter_event_types_1.SocketEvents.Error, errMessage, dataObj);
            return;
        }
        this.parseIncomingMessage(dataObj);
    }
    //----------------//
    onConnect(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketConnect, listener);
    }
    onDisconnect(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketClosed, listener);
    }
    onEvent(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewEvent, listener);
    }
    onMessage(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewMessage, listener);
    }
    onError(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.Error, listener);
    }
}
exports.ClientSocket = ClientSocket;
/*

let args = process.argv.slice(2);
console.log("args", args);

let client = new ClientSocket(IgniterSettings.DefSocketPath);

client.onConnect(() => {
    console.log("onConnect::::");
    let mess = {
        age: 12,
        kalle: "kula"
    };

    client.emitMessage(mess);
});

client.connect("http://localhost:3700");
*/ 
