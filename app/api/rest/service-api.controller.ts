/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import {IRestApiController, IWSApiController} from "@api/api-controller";
import { Request }                from "express";
import { Response }               from "express";
import { Router }                 from "express";
import { Logger }                 from "@cli/cli.logger";
import { IZapResult }             from '@zapModels/zap-result';
import { ZapResult }              from '@zapModels/zap-result';
import { CliCommander }           from '@cli/cli.commander';
import { ZynPostData }            from '@lib/zyn-express/zyn.post-data';
import { ZynRemoteIp }            from '@lib/zyn-express/webserver/utils/zyn.remote-ip';
import {IZynSocketServer} from '@igniter/coldmind/socket-io.server';
import {ClientSocket} from '@igniter/coldmind/socket-io.client';
import {GoogleCaptcha} from '@components/google-captcha';

export class ServiceApiController implements IRestApiController {
	constructor(public debugMode: boolean = false) {}

	/**
	 * Aquire HTTP Session ID
	 * @returns {Promise<string>}
	 */
	public aquireSession(): Promise<string> {
		return new Promise((resolve, reject) => {
		});
	}

	private verifyCaptcha(req: Request, resp: Response): void {
		let gCaptcha = new GoogleCaptcha();

		let zynPostRequest = new ZynPostData();

		console.log("verifyCaptcha :: BODY:: ", req.body);

		let gResponse = req.body.resp;
		let remoteIp = ZynRemoteIp.getRemoteIp(req);

		gCaptcha.verifyGCaptcha(gResponse, remoteIp).then(res => {
			resp.json(res);
		});
	}

	public initRoutes(routes: Router): void {
		let scope = this;

		routes.get("/test2", function(req, res) {
			console.log("TypeOf Session ::", typeof req.session);
			res.end('welcome to the session demo. refresh! :: ');
		});


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
