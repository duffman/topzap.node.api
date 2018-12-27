/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Router }                 from "express";
import { Request }                from "express";
import { Response }               from "express";
import { IApiController }         from '@api/api-controller';

export class DataDumpApiController implements IApiController {
	constructor(public debugMode: boolean = false) {
	}

	private doDataDump(req: Request, resp: Response): void {
	}

	public initRoutes(routes: Router): void {
		routes.post('/dump', this.doDataDump.bind(this));
	}
}
