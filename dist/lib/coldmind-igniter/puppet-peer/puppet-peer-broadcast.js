"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const igniter_settings_1 = require("../igniter.settings");
const gatling_service_1 = require("../gatling-service/gatling-service");
const gatling_message_1 = require("../gatling-service/gatling-message");
const boradcast_message_1 = require("../messaging/boradcast-message");
const igniter_log_1 = require("../igniter-log");
const puppet_settings_1 = require("./puppet.settings");
class PuppetPeerBroadcast {
    constructor() {
        igniter_log_1.Log.data("PuppetPeerBroadcas :: construct");
        this.gatlingService = new gatling_service_1.GatlinService();
    }
    broadcastPresence(serverPort, addressInfo = null, onPeerDiscovered) {
        let serviceHost = igniter_settings_1.IgniterSettings.Gatling.GATLING_DISCOVERY_HOST;
        let servicePort = puppet_settings_1.PuppetSettings.ServiceBroadcastPort;
        let service = this.gatlingService;
        let addrInfo = addressInfo;
        console.log("##### ::: serverPort ::", serverPort);
        if (addrInfo === null) {
            igniter_log_1.Log.error("##### ::: broadcastPresence :: err ::", new Error("No Address Info"));
            return;
        }
        igniter_log_1.Log.info(`servicePort :: startSignaling :: '${serviceHost}):${servicePort}'`);
        if (service.start(serviceHost, servicePort, onPeerDiscovered) === false) {
            igniter_log_1.Log.error(`broadcastPresence :: service.start :: error`);
        }
        //
        // Start firing away UDP messages
        //
        let discoveryMessage = new boradcast_message_1.BroadcastMessage(puppet_settings_1.PuppetSettings.Local, serverPort);
        igniter_log_1.Log.data("##### ::: discoveryMessage ::", discoveryMessage);
        let data = new gatling_message_1.GatlingMessage(serviceHost, servicePort, discoveryMessage);
        this.gatlingService.emit(data);
    }
}
exports.PuppetPeerBroadcast = PuppetPeerBroadcast;
