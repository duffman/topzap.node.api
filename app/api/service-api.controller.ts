/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IApiController }         from "@api/api-controller";
import { Request }                from "express";
import { Response }               from "express";
import { Router }                 from "express";
import { Logger }                 from "@cli/cli.logger";
import { IZapResult }             from '@zapModels/zap-result';
import { ZapResult }              from '@zapModels/zap-result';
import { CliCommander }           from '@cli/cli.commander';
import { ZynPostData }            from '@lib/zyn-express/zyn.post-data';
import { ZynRemoteIp }            from '@lib/zyn-express/webserver/utils/zyn.remote-ip';

export class ServiceApiController implements IApiController {
	constructor(public debugMode: boolean = false) {}

	public verifyGCaptcha(gResponse: string, remoteIp: string = ''): Promise<IZapResult> {
		let result = new ZapResult();
		let zynPostRequest = new ZynPostData();

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

	private verifyCaptcha(req: Request, resp: Response): void {
		let zynPostRequest = new ZynPostData();

		console.log("BODY:: ", req.body);

		let gResponse = req.body.resp;
		let remoteIp = ZynRemoteIp.getRemoteIp(req);

		this.verifyGCaptcha(gResponse, remoteIp).then(res => {
			resp.json(res);
		});
	}

	public initRoutes(routes: Router) {
		let scope = this;

		routes.post("/service/recaptcha", this.verifyCaptcha.bind(this));

		//
		// Get Miner Session
		//
		routes.get("/service/kind:id", (req, resp) => {
			Logger.logCyan("Miner Name ::", name);

			let kind = req.params.kind;

			let body = `<html><body>
					<h1>TopZap Api - Service</h1>

			</body></html>`;


			resp.send(body);
			resp.end();
		});

	}
}

if (CliCommander.haveArgs()) {
	let test = new ServiceApiController();
	test.verifyGCaptcha("Kalle");
}