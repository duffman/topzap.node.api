/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IApiController } from "@api/api-controller";
import {Router} from "express";
import {Logger} from "@cli/cli.logger";

export class ServiceApiController implements IApiController {
	public initRoutes(routes: Router) {
		let scope = this;

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