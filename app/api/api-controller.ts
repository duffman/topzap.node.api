

/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Router }                 from "express";
import { IZynMiddleware }         from "@zynIgniter/../../lib/zyn-express/zyn.middleware";
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';

/**
 * Core Controller
 */
export interface IWebAppController extends IZynMiddleware {
}

/**
 * API Controller
 */
export interface IApiController extends IWebAppController {
	debugMode: boolean;
	attachWSS(wss: ISocketServer): void;
	initRoutes(routes: Router): void;
}