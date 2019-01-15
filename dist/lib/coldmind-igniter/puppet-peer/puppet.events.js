"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * December 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
var PuppetEvents;
(function (PuppetEvents) {
    let Client;
    (function (Client) {
        Client.Connect = "connect"; // Fired upon a successful connection
        Client.ConnectError = "connect_error"; // Fired upon a connection error
        Client.ConnectTimeout = "connect_timeout"; // Fired upon a connection timeout
        Client.Reconnect = "reconnect"; // Fired upon a successful reconnection
        /*

        Parameters:
        Number reconnection attempt number

        reconnect_attempt. Fired upon an attempt to reconnect.

        reconnecting. Fired upon an attempt to reconnect.
        Parameters:
        Number reconnection attempt number

        reconnect_error. Fired upon a reconnection attempt error.
        Parameters:
        Object error object

        reconnect_failed. Fired when couldn’t reconnect within reconnectionAttempts
        */
        Client.Disconnect = "disconnect";
    })(Client = PuppetEvents.Client || (PuppetEvents.Client = {}));
    let Server;
    (function (Server) {
        Server.Connection = "connection";
        Server.Connect = "connect";
    })(Server = PuppetEvents.Server || (PuppetEvents.Server = {}));
})(PuppetEvents = exports.PuppetEvents || (exports.PuppetEvents = {}));
