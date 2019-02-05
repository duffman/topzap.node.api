"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_logger_1 = require("@cli/cli.logger");
const zyn_post_data_1 = require("@lib/zyn-express/zyn.post-data");
const zyn_remote_ip_1 = require("@lib/zyn-express/webserver/utils/zyn.remote-ip");
const google_captcha_1 = require("@components/google-captcha");
class ServiceApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
    }
    /**
     * Aquire HTTP Session ID
     * @returns {Promise<string>}
     */
    aquireSession() {
        return new Promise((resolve, reject) => {
        });
    }
    verifyCaptcha(req, resp) {
        let gCaptcha = new google_captcha_1.GoogleCaptcha();
        let zynPostRequest = new zyn_post_data_1.ZynPostData();
        console.log("verifyCaptcha :: BODY:: ", req.body);
        let gResponse = req.body.resp;
        let remoteIp = zyn_remote_ip_1.ZynRemoteIp.getRemoteIp(req);
        gCaptcha.verifyGCaptcha(gResponse, remoteIp).then(res => {
            resp.json(res);
        });
    }
    initRoutes(routes) {
        let scope = this;
        routes.get("/test2", function (req, res) {
            console.log("TypeOf Session ::", typeof req.session);
            res.end('welcome to the session demo. refresh! :: ');
        });
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
