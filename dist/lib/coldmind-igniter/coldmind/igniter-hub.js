"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("./socket-io.client");
const socket_io_server_1 = require("./socket-io.server");
const events_1 = require("events");
const igniter_event_types_1 = require("./igniter-event.types");
class IgniterHub {
    constructor(serverPath) {
        this.serverPath = serverPath;
        this.eventEmitter = new events_1.EventEmitter();
        this.client = new socket_io_client_1.IgniterClientSocket();
        this.client.onConnect(() => {
            console.log("Client Connect");
        });
        this.client.onDisconnect(() => {
            console.log("Client DisConnect");
        });
        this.client.onEvent((data) => {
            console.log("Client Event ::", data);
        });
        this.client.onMessage((data) => {
            console.log("Client Message ::", data);
        });
        this.client.onError((data) => {
            console.log("Client Error ::", data);
        });
        this.server = new socket_io_server_1.SocketServer();
    }
    connectClient(url, path = null) {
        this.client.connect(url);
    }
    onNewConnection(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.NewConnection, listener);
    }
    onConnectionClosed(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.SocketClosed, listener);
    }
    onData(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.DataAvailable, listener);
    }
    onError(listener) {
        this.eventEmitter.addListener(igniter_event_types_1.SocketEvents.Error, listener);
    }
}
exports.IgniterHub = IgniterHub;
let args = process.argv.slice(2);
console.log("args", args);
if (args[1] == "connect") {
    let hub = new IgniterHub(args[0]);
    hub.connectClient("http://localhost:3000", args[0]);
}
