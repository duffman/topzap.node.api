/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { Express }                from "express";
import { Request, Response }      from 'express';

export class ServerApi {
	protected internalError(res: Response, message: string = "") {
		res.writeHead(501, {'Content-Type': 'text/plain'});
		res.end(message);
	}
}