/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { ApiController }          from "@api/api-controller";
import { Express }                from "express";
import { Request, Response }      from 'express';

export class ServerApi implements ApiController {
	public static internalError(res: Response, message: string = "") {
		res.writeHead(501, {'Content-Type': 'text/plain'});
		res.end(message);
	}
}