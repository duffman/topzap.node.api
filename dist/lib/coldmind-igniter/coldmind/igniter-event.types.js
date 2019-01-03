"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var SocketEvents;
(function (SocketEvents) {
    SocketEvents.NewConnection = "newConnection";
    SocketEvents.ServerStarted = "serverStarted";
    SocketEvents.ServerStartError = "serverStartErr";
    SocketEvents.SocketConnect = "connect";
    SocketEvents.SocketDisconnect = "disconnect";
    SocketEvents.SocketClosed = "closed";
    SocketEvents.NewMessage = "newMess";
    SocketEvents.NewEvent = "newEvent";
    SocketEvents.DataAvailable = "dataAvailable";
    SocketEvents.ReConnect = "reconnect";
    SocketEvents.Error = "error";
})(SocketEvents = exports.SocketEvents || (exports.SocketEvents = {}));
