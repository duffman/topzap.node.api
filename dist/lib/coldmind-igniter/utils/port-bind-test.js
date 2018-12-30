"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * December 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const igniter_log_1 = require("../igniter-log");
class PortBindTest {
    constructor() {
    }
    /**
     * Test if a TCP port is free and able to bind to
     * @param portNum
     */
    portIsFree(portNum) {
        return new Promise((resolve, reject) => {
            let srv = net.createServer((socket) => { socket.end("COLDMIND.IGNITER"); });
            try {
                srv.listen(portNum, () => {
                    igniter_log_1.Log.info("Listening on ::" + srv.address());
                    srv.close(() => {
                        resolve(true);
                    });
                });
            }
            catch (err) {
                igniter_log_1.Log.error("portIsFree :: err ::", err);
                resolve(false);
            }
        });
    }
}
exports.PortBindTest = PortBindTest;
