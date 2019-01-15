"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const puppet_settings_1 = require("../puppet-peer/puppet.settings");
const igniter_log_1 = require("../igniter-log");
//import Socket as DGramSocket from "dgram";
const dgram = require('dgram');
class GatlinService {
    constructor() {
        this.timerInterval = 5000;
        this.sender = this.createDGramSocket(); // dgram.createSocket('udp4');
        this.listener = this.createDGramSocket(); // dgram.createSocket('udp4');
    }
    createDGramSocket() {
        let options = { type: "udp4", reuseAddr: true };
        let dgramSock = dgram.createSocket(options);
        return dgramSock;
    }
    emitMessage(message) {
        let dataStr = JSON.stringify(message.data);
        igniter_log_1.Log.data("DATA STRING ::", dataStr);
        const messageBuf = Buffer.from(dataStr);
        try {
            this.sender.send(messageBuf, 0, messageBuf.length, message.port, message.host, (err, bytes) => {
                if (err)
                    throw err;
                console.log('UDP message sent to ' + message.host + ':' + message.port);
                //this.sender.close();
            });
        }
        catch (err) {
            igniter_log_1.Log.info("Gatling Service :: error emitting message");
            //Log.error("emitMessage :: error ::", new Error("error emitting"));
            igniter_log_1.Log.error("emitMessage :: error ::", err);
            if (err === "ERR_SOCKET_DGRAM_NOT_RUNNING") {
                console.log("not running");
            }
            //ERR_SOCKET_DGRAM_NOT_RUNNING
        }
    }
    emit(bullet) {
        let scope = this;
        this.timer = setInterval(function () { scope.emitMessage(bullet); }, scope.timerInterval);
    }
    start(host, port, callback) {
        /*
        var done = undefined;

        done = (function wait () {
            // As long as it's nor marked as done, create a new event+queue
            if (!done) setTimeout(wait, 1000);
            // No return value; done will resolve to false (undefined)
        })();
        */
        this.listener.on('listening', () => {
            this.listener.addMembership(puppet_settings_1.PuppetSettings.MulticastAddress);
            const address = this.listener.address();
            igniter_log_1.Log.data('UDP Server listening on ', address);
        });
        this.listener.on('message', (message, remote) => {
            callback(message, remote);
            console.log(remote.address + ':' + remote.port + ' - ' + message);
        });
        try {
            this.listener.bind(port, host);
        }
        catch (ex) {
            igniter_log_1.Log.error("updtest: bind() error: " + ex.stack);
            return false;
        }
        return true;
    }
}
exports.GatlinService = GatlinService;
