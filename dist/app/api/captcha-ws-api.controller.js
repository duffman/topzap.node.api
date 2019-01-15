"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zap_message_types_1 = require("@zapModels/messages/zap-message-types");
class CaptchaWsApiController {
    attachWSS(wss) {
        this.wss = wss;
    }
    attachServiceClient(client) {
        this.serviceClient = client;
        this.serviceClient.onMessage(this.onServiceMessage.bind(this));
    }
    onServiceMessage(mess) {
        if (mess.id === zap_message_types_1.ZapMessageType.GCaptchaVerify) {
        }
    }
    initRoutes(routes) { }
}
exports.CaptchaWsApiController = CaptchaWsApiController;
