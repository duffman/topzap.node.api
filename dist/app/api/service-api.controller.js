"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const zap_result_1 = require("@zapModels/zap-result");
const cli_commander_1 = require("@cli/cli.commander");
const zyn_post_data_1 = require("@lib/zyn-express/zyn.post-data");
const zyn_remote_ip_1 = require("@lib/zyn-express/webserver/utils/zyn.remote-ip");
class ServiceApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }
    verifyGCaptcha(gResponse, remoteIp = '') {
        let result = new zap_result_1.ZapResult();
        let zynPostRequest = new zyn_post_data_1.ZynPostData();
        // Needs to differ for different routes??
        let appSecret = "6LeYWn4UAAAAADNvTRK3twgps530_PnrO8ZuuaPM";
        let payload = {
            "form": {
                "secret": appSecret,
                "response": gResponse,
                "remoteip": remoteIp
            }
        };
        const googleReCaptchaUrl = "https://www.google.com/recaptcha/api/siteverify";
        return new Promise((resolve, reject) => {
            zynPostRequest.postData2(googleReCaptchaUrl, payload).then(res => {
                console.log("res ::", res);
                //let gRes = GCAPTCHAResult.toIGCAPTCHAResult(res);
                result.success = res.success;
                console.log("result ::", result);
                console.log("result.success ::", result.success);
                resolve(result);
            }).catch(err => {
                console.log("err ::", err);
                result.error = err;
                resolve(result);
            });
        });
    }
    verifyCaptcha(req, resp) {
        let zynPostRequest = new zyn_post_data_1.ZynPostData();
        console.log("BODY:: ", req.body);
        let gResponse = req.body.resp;
        let remoteIp = zyn_remote_ip_1.ZynRemoteIp.getRemoteIp(req);
        this.verifyGCaptcha(gResponse, remoteIp).then(res => {
            resp.json(res);
        });
    }
    attachWSS(wss) {
    }
    initRoutes(routes) {
        let scope = this;
        routes.post("/service/recaptcha", this.verifyCaptcha.bind(this));
        //
        // Get Miner Session
        //
        routes.get("/service/kind:id", (req, resp) => {
            cli_logger_1.Logger.logCyan("Miner Name ::", name);
            let kind = req.params.kind;
            let body = `<html><body>
					<h1>TopZap Api - Service</h1>

			</body></html>`;
            resp.send(body);
            resp.end();
        });
    }
}
exports.ServiceApiController = ServiceApiController;
if (cli_commander_1.CliCommander.haveArgs()) {
    let test = new ServiceApiController();
    test.verifyGCaptcha("Kalle");
}
