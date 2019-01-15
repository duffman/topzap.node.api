"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ZynSioSession {
    constructor(socket) {
        this.socket = socket;
        this.id = socket.id;
    }
    setValue(key, value) {
        this.socket.session.set(key, value);
    }
    get(key) {
        return this.getValue(key);
    }
    getValue(key) {
        return this.socket.session.get(key);
    }
    clear() {
        this.socket.session.clearSession();
    }
}
exports.ZynSioSession = ZynSioSession;
