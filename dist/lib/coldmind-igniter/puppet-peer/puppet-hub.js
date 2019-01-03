"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const puppet_client_1 = require("./puppet-client");
const puppet_server_1 = require("./puppet-server");
const puppet_peer_broadcast_1 = require("./puppet-peer-broadcast");
const igniter_log_1 = require("../igniter-log");
const igniter_cli_1 = require("../igniter-cli");
const boradcast_message_1 = require("../messaging/boradcast-message");
const puppet_settings_1 = require("./puppet.settings");
const listener_result_1 = require("../types/listener-result");
const igniter_settings_1 = require("../igniter.settings");
const event_types_1 = require("@igniter/messaging/event-types");
class PuppetHub {
    broadcastPresence(listenResult) {
        let broadcastPort = puppet_settings_1.PuppetSettings.ServiceBroadcastPort;
        igniter_log_1.Log.data("Broadcast Port ::", broadcastPort);
        this.serviceBroadcast = new puppet_peer_broadcast_1.PuppetPeerBroadcast();
        this.serviceBroadcast.broadcastPresence(this.serverPort, listenResult.addressInfo, this.onMessage.bind(this));
    }
    constructor(name) {
        igniter_log_1.Log.info("PuppetHub :: name ::", name);
        this.hubName = name;
        this.client = new puppet_client_1.PuppetClient();
        this.server = new puppet_server_1.PuppetServer();
    }
    startServer(port = -1) {
        this.serverPort = port;
        let scope = this;
        let result = new listener_result_1.SrvListenResult();
        igniter_log_1.Log.info(`startServer :: port(${this.serverPort})`);
        return new Promise((resolve, reject) => {
            scope.server.startListening(this.serverPort).then(res => {
                igniter_log_1.Log.data("server.startListening ::", res);
                if (res.success) {
                    result.success = true;
                    this.broadcastPresence(res);
                }
                resolve(result);
            }).catch(err => {
                resolve(result);
            });
        });
    }
    onDiscoveryMessage(messData) {
        igniter_log_1.Log.data("onDiscoveryMessage :: messData ::", messData);
        if (messData.data.action === event_types_1.EventType.Actions.Connect) {
            igniter_log_1.Log.data("onDiscoveryMessage :: action === connect", messData);
            let clientOptions = {
                host: messData.host,
                port: messData.port,
                retryAlways: true,
                reConnectInterval: igniter_settings_1.IgniterSettings.ReConnectInterval
            };
            this.client.connect(clientOptions).then(res => {
                if (res) {
                    igniter_log_1.Log.info("TCP Client Connect Success!!");
                }
                else {
                    igniter_log_1.Log.info("TCP Client Connect FAIL!!");
                }
            });
        }
    }
    onMessage(data, remote) {
        let message = boradcast_message_1.DataConvert.toDiscoveryMessData(data);
        let messData = message;
        if (messData && messData.data && messData.data.type === event_types_1.EventType.Broadcast) {
            this.onDiscoveryMessage(messData);
        }
        console.log("onDiscoveryMessage ::", message);
    }
}
exports.PuppetHub = PuppetHub;
let args = process.argv.slice(2);
console.log("args", args);
if (igniter_cli_1.IgniterCli.startHub()) {
    console.log("Start HUB");
    let portNum = -1;
    let hubName = args[2];
    try {
        portNum = Number.parseInt(args[1]);
    }
    catch (ex) {
        console.log("Invalid Service Listener Port");
        process.exit(345);
    }
    let hub = new PuppetHub(hubName);
    hub.startServer(portNum).then(res => {
        igniter_log_1.Log.data("Start Server Res ::", res);
    });
}
else {
    igniter_log_1.Log.error("PuppetHub :: start :: error", new Error("Incorrect param count"));
}
