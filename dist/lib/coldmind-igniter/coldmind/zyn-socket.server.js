"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_types_1 = require("./socket-io.types");
const igniter_event_types_1 = require("@igniter/coldmind/igniter-event.types");
const events_1 = require("events");
const igniter_settings_1 = require("@igniter/igniter.settings");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const message_utils_1 = require("@igniter/messaging/message-utils");
const message_types_1 = require("@igniter/messaging/message-types");
const message_factory_1 = require("@igniter/messaging/message-factory");
const zyn_socket_session_1 = require("@igniter/coldmind/zyn-socket-session");
const cli_logger_1 = require("@cli/cli.logger");
class SocketEntry {
    constructor(socketId, session) {
        this.socketId = socketId;
        this.session = session;
    }
}
exports.SocketEntry = SocketEntry;
class SocketServer {
    constructor() {
        this.serverPort = igniter_settings_1.IgniterSettings.DefSocketServerPort;
        this.eventEmitter = new events_1.EventEmitter();
        this.sessionSockets = new Array();
    }
    startListen(port = igniter_settings_1.IgniterSettings.DefSocketServerPort) {
        this.httpServer.listen(port);
    }
    getSessionBySocketId(socketId) {
        let result;
        let entry = this.getSessionSocketEntry(socketId);
        if (entry !== null && entry.socketId === socketId) {
            result = entry.session;
        }
        return result;
    }
    showAllSocketIds(label) {
        console.log(" ");
        console.log(label, " -------------");
        console.log("ALL SOCKETS !");
        for (const entry of this.sessionSockets) {
            console.log(": ID: ", entry.socketId);
        }
        console.log(" ");
    }
    getSessionSocketEntry(socketId) {
        console.log("GET SOCKETS :: socketId :", socketId);
        this.showAllSocketIds("getSessionSocketEntry");
        let result = null;
        for (const entry of this.sessionSockets) {
            if (entry.socketId === socketId) {
                result = entry;
                break;
            }
        }
        return result;
    }
    setSessionSocket(socket) {
        this.showAllSocketIds("setSessionSocket :: " + socket.id);
        let entry = this.getSessionSocketEntry(socket.id);
        if (entry !== null) {
            return false;
        }
        entry = new SocketEntry(socket.id, socket.session);
        this.sessionSockets.push(entry);
        return true;
    }
    removeSessionSocket(socketId) {
        let result = false;
        for (let i = 0; i < this.sessionSockets.length; i++) {
            let entry = this.sessionSockets[i];
            if (entry.socketId === socketId) {
                this.sessionSockets.splice(i, 1);
                result = true;
                break;
            }
        }
        return result;
    }
    emitMessageToSocket(socketId, messageType, mess) {
        let result = true;
        let socket = this.io.sockets.connected[socketId];
        if (socket && socket.emit) {
            console.log("Emitting ::");
            socket.emit(messageType, mess);
        }
        else {
            result = false;
            cli_logger_1.Logger.logFatalError("");
        }
        return result;
    }
    sendMessageToSocket(socketId, mess) {
        console.log("sendToSessionId ::", mess);
        return this.emitMessageToSocket(socketId, socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, mess);
    }
    sendError(socketId, id, data, tag = null) {
        data = data === null ? {} : data;
        let mess = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Error, id, data, tag);
        return this.sendMessageToSocket(socketId, mess);
    }
    messError(socketId, mess, err) {
        return this.sendError(socketId, mess.id, JSON.stringify(err), mess.tag);
    }
    /*
    
        public attachSocketIO(socket: Server): void {
            socket.on(IOTypes.SOCKET_IO_CONNECTION, this.onConnect.bind(this));
            socket.on(IOTypes.SOCKET_IO_DISCONNECT, this.socketDisconnect.bind(this));
    
    
            socket.on(IOTypes.SOCKET_IO_MESSAGE, (obj1, obj2) => {
                console.log("BALLE :: ", obj1);
                console.log("BALLE :: ", obj2);
    
    
                this.handleMessage(obj1, obj2);
            });
    
            socket.on(IOTypes.SOCKET_IO_MESSAGE, this.handleMessage.bind(this));
    
    
            this.io = socket;
        }
    
        private onConnect(socket: any) { //SocketIOClient.Socket) {
            this.setSessionSocket(socket);
    
            console.log("SERVER :: New Client Connected!");
            console.log("SERVER :: SESSION ID ::", socket.request.sessionID);
            console.log("SERVER :: SOCKET ID ::", socket.id);
            console.log("SERVER :: SOCKET SESSION ::", !PVarUtils.isNullOrUndefined(socket.session));
    
            this.handleConnection(socket);
        }
    
        private socketDisconnect(socket: any = null): void {
            console.log("SERVER->DISCONNECT :: SESSION ID ::", socket.request.sessionID);
    
            this.removeSessionSocket(socket.id); //socket.request.sessionID);
            this.eventEmitter.emit(SocketEvents.SocketDisconnect, socket);
        }
    
        private handleConnection(socket: ExtSioSocket) {
            this.eventEmitter.emit(SocketEvents.NewConnection, socket);
            //console.log("----------- socket sug ::", socket);
        }
    
        private handleMessage(message: any, socket: ExtSioSocket) {
            let dataObj: any = message;
    
            console.log("handleMessage :: New Client Connected!");
            console.log("handleMessage :: SESSION ID ::", socket.request.sessionID);
            console.log("handleMessage :: SOCKET ID ::", socket.id);
            console.log("handleMessage :: SOCKET SESSION ::", !PVarUtils.isNullOrUndefined(socket.session));
    
            try {
                if (typeof message === "string") {
                    dataObj = JSON.parse(message);
                }
    
                if (MessageUtils.validateMessageType(dataObj) === false) {
                    let errMessage = "Invalid Message Type, does not conform to ZynMessage";
                    this.eventEmitter.emit(SocketEvents.Error, errMessage, message);
                    return;
                }
    
            } catch (ex) {
                console.log("Error in handleMessage:: ", message);
                console.log("handleMessage parse failed:", ex);
                this.eventEmitter.emit(SocketEvents.Error, "handleMessage", ex);
                return;
            }
    
            console.log(">>>>> handleMessage", "Create Socket Session");
            let zynSession = new ZynSession(socket);
            console.log(">>>>> handleMessage :: zynSession ::", zynSession.sessionId);
            let zynMess = new ZynMessage(dataObj.type, dataObj.id, dataObj.data, dataObj.tag);
            message.socket = socket; // Attach socket so that we can reply from within the message <--- HACK
    
            this.eventEmitter.emit(SocketEvents.NewMessage, zynSession, zynMess);
        }
    
        */
    attachSocketIO(socket) {
        socket.on(socket_io_types_1.IOTypes.SOCKET_IO_CONNECTION, this.onConnect.bind(this));
        this.io = socket;
    }
    onConnect(socket) {
        this.setSessionSocket(socket);
        console.log("SERVER :: New Client Connected ::", socket.id);
        console.log("SERVER :: SESSION ID ::", socket.request.sessionID);
        this.handleConnection(socket);
    }
    socketDisconnect(socket = null) {
        console.log("SERVER->DISCONNECT :: SESSION ID ::", socket.request.sessionID);
        this.removeSessionSocket(socket.request.sessionID);
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.SocketDisconnect, socket);
    }
    handleConnection(socket) {
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewConnection, socket);
        socket.on(socket_io_types_1.IOTypes.SOCKET_IO_DISCONNECT, () => {
            this.socketDisconnect(socket);
        });
        socket.on(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, (data) => {
            console.log("<< SERVER :: NEW MESSAGE ::", data);
            this.handleMessage(data, socket);
        });
    }
    handleMessage(message, socket) {
        let dataObj = message;
        try {
            if (typeof message === "string") {
                dataObj = JSON.parse(message);
            }
            if (message_utils_1.MessageUtils.validateMessageType(dataObj) === false) {
                let errMessage = "Invalid Message Type, does not conform to IgniterMessage";
                this.eventEmitter.emit(igniter_event_types_1.SocketEvents.Error, errMessage, message);
                return;
            }
        }
        catch (ex) {
            console.log("Error in handleMessage:: ", message);
            console.log("handleMessage parse failed:", ex);
            this.eventEmitter.emit(igniter_event_types_1.SocketEvents.Error, "handleMessage", ex);
            return;
        }
        console.log(">>>>> handleMessage", "Create Socket Session");
        let zynSession = new zyn_socket_session_1.ZynSession(socket);
        console.log(">>>>> handleMessage :: zynSession ::", zynSession.sessionId);
        let zynMess = new igniter_messages_1.ZynMessage(dataObj.type, dataObj.id, dataObj.data, dataObj.tag);
        message.socket = socket; // Attach socket so that we can reply from within the message <--- HACK
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewMessage, zynSession, zynMess);
    }
    onServerStarted(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.ServerStarted, listener);
    }
    onServerStartError(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.ServerStartError, listener);
    }
    onNewConnection(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewConnection, listener);
    }
    onDisconnect(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketDisconnect, listener);
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
exports.SocketServer = SocketServer;
/*
public createServer() {
let httpServer = http.createServer();

httpServer.on('listening', () => {
    console.log("IOServer Listening on port ::", this.serverPort);
    this.eventEmitter.emit(SocketEvents.ServerStarted, this.serverPort);
});

httpServer.on("error", (err) => {
    console.log("IOServer Start Failed ::", err);
    this.eventEmitter.emit(SocketEvents.ServerStartError, err);
});

const io = require('socket.io')({
    serveClient: false,
});

io.attach(httpServer, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: true
});

this.attachSocketIO(io);
this.httpServer = httpServer;
}
*/
/*
let args = process.argv.slice(2);
console.log("args", args);
*/
//let server = new SocketServer(IgniterSettings.DefSocketPath);
