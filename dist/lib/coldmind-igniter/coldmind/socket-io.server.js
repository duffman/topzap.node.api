"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const socket_io_types_1 = require("./socket-io.types");
const igniter_event_types_1 = require("@igniter/coldmind/igniter-event.types");
const events_1 = require("events");
const igniter_settings_1 = require("@igniter/igniter.settings");
const igniter_messages_1 = require("@igniter/messaging/igniter-messages");
const message_utils_1 = require("@igniter/messaging/message-utils");
class SocketEntry {
    constructor(sessionId, socket) {
        this.sessionId = sessionId;
        this.socket = socket;
    }
}
exports.SocketEntry = SocketEntry;
class SocketServer {
    constructor(createServer = true) {
        this.serverPort = igniter_settings_1.IgniterSettings.DefSocketServerPort;
        this.eventEmitter = new events_1.EventEmitter();
        this.sessionSockets = new Array();
        if (createServer) {
            this.createServer();
        }
    }
    getSessionSocketEntry(sessId) {
        let result = null;
        for (const entry of this.sessionSockets) {
            if (entry.sessionId === sessId) {
                result = entry;
                break;
            }
        }
        return result;
    }
    setSessionSocket(sessId, socket) {
        let entry = this.getSessionSocketEntry(sessId);
        if (entry !== null) {
            return false;
        }
        entry = new SocketEntry(sessId, socket);
        this.sessionSockets.push(entry);
        return true;
    }
    removeSessionSocket(sessId) {
        let result = false;
        for (let i = 0; i < this.sessionSockets.length; i++) {
            let entry = this.sessionSockets[i];
            if (entry.sessionId === sessId) {
                this.sessionSockets.splice(i, 1);
                result = true;
                break;
            }
        }
        return result;
    }
    sendToSession(sessId, message) {
        let entry = this.getSessionSocketEntry(sessId);
        console.log("sendToSession :: sessId ::", sessId);
        if (entry === null) {
            return false;
        }
        console.log("emitting :: socketId ::", entry.socket.id);
        entry.socket.emit(socket_io_types_1.IOTypes.SOCKET_IO_MESSAGE, message);
        return true;
    }
    createServer() {
        let httpServer = http.createServer();
        httpServer.on('listening', () => {
            console.log("IOServer Listening on port ::", this.serverPort);
            this.eventEmitter.emit(igniter_event_types_1.SocketEvents.ServerStarted, this.serverPort);
        });
        httpServer.on("error", (err) => {
            console.log("IOServer Start Failed ::", err);
            this.eventEmitter.emit(igniter_event_types_1.SocketEvents.ServerStartError, err);
        });
        console.log("pok 1");
        const io = require('socket.io')({
            //			path: "/" + serverPath,
            serveClient: false,
        });
        io.attach(httpServer, {
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: true
        });
        this.attachSocketIO(io);
        this.httpServer = httpServer;
        /*

        let options = {
            path: '/igniter',
            serveClient: false,
            // below are engine.IO options
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false
        };

        const io = new IOServer(); //httpServer, options);
        io(httpServer, options);
        */
    }
    attachSocketIO(socket) {
        socket.on(socket_io_types_1.IOTypes.SOCKET_IO_CONNECTION, this.onConnect.bind(this));
        this.io = socket;
    }
    startListen(port = igniter_settings_1.IgniterSettings.DefSocketServerPort) {
        this.httpServer.listen(port);
    }
    onConnect(socket) {
        console.log("SERVER :: New Client Connected ::", socket.id);
        console.log("SERVER :: SESSION ID ::", socket.request.sessionID);
        this.setSessionSocket(socket.request.sessionID, socket);
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
        let igniterMessage = new igniter_messages_1.IgniterMessage(dataObj.type, dataObj.id, dataObj.data, dataObj.tag);
        igniterMessage.socket = socket; // Attach socket so that we can reply from within the message
        this.eventEmitter.emit(igniter_event_types_1.SocketEvents.NewMessage, igniterMessage);
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
let args = process.argv.slice(2);
console.log("args", args);
*/
//let server = new SocketServer(IgniterSettings.DefSocketPath);
