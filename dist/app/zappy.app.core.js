"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ZappyAppCore {
    constructor() {
        this.version = "0.7.1";
    }
    getAppVersion() {
        return "topzap.node.api/" + this.version;
    }
    getSecret() {
        return "ZapApp-Node-API/WillyW0nka";
    }
}
exports.ZappyAppCore = ZappyAppCore;
