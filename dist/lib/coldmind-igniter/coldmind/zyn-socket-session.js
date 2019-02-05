"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
class ZynSession {
    constructor(socket) {
        this.socket = socket;
        this.sessionId = socket.request.sessionID;
        this.sessionData = socket.session;
        this.id = socket.id;
    }
    set(key, value) {
        cli_logger_1.Logger.logPurple("--- ZynSession set :: key ::", key);
        this.socket.session.set(key, value);
    }
    getAs(key) {
        return this.get(key);
    }
    get(key) {
        return this.socket.session.get(key);
    }
    clear() {
        this.socket.session.clearSession();
    }
}
exports.ZynSession = ZynSession;
