"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var IgniterSettings;
(function (IgniterSettings) {
    IgniterSettings.DefSocketPath = "igniter";
    IgniterSettings.DefSocketServerPort = 3700;
    IgniterSettings.ColdindNet = 'http://localhost:9090';
    IgniterSettings.ReConnectInterval = 2000;
    let Gatling;
    (function (Gatling) {
        Gatling.GATLING_DISCOVERY_HOST = '127.0.0.1';
        Gatling.GATLING_DISCOVERY_PORT = 33333;
    })(Gatling = IgniterSettings.Gatling || (IgniterSettings.Gatling = {}));
})(IgniterSettings = exports.IgniterSettings || (exports.IgniterSettings = {}));
