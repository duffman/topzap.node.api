

/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Router }                 from "express";

/**
 * Core Controller
 */
export interface IWebAppController {
	setRouter(routes: Router);
}

/**
 * API Controller
 */
export interface IApiController extends IWebAppController {
}