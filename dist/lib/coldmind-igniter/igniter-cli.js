"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
let args = process.argv.slice(2);
let haveArgs = args.length === 3;
let cmd = "";
if (haveArgs) {
    cmd = args[0];
}
class IgniterCli {
    static startHub() {
        return (haveArgs && cmd === "hub");
    }
    static startClient() {
        return (haveArgs && cmd === "client");
    }
    static startServer() {
        return (haveArgs && cmd === "server");
    }
}
exports.IgniterCli = IgniterCli;
