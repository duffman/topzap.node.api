/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Express, Router }        from "express";
import { IApiController }         from "@api/api-controller";

export class ProductApi implements IApiController{
	constructor() {}

	public setRouter(routes: Router) {
		let scope = this;
		//
		// Product Bid
		//
		routes.get("/bid/:barcode", (req, res) => {
			let barcode = req.params.barcode;

		});

		//
		// Product Bid
		//
		routes.post("/calcbasket/:barcode", (req, res) => {
			let fruits = req.body.items.split(",");
			console.log(fruits); // This is an array
		});
	}
}