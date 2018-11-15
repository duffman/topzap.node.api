/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { Express }                from "express";
import { Request, Response }      from 'express';
import { MinerDb}                 from "@miner/miner-db";
import { IDbResult }              from "@db/db-result";
import { ApiController }          from "@api/api-controller";

export class ProductApi implements ApiController{

	constructor() {}

	public init(expressApp: Express) {
		let scope = this;

		//
		// Product Bid
		//
		expressApp.get("/bid/:barcode", (req, res) => {
			let barcode = req.params.barcode;

		});

		//
		// Product Bid
		//
		expressApp.post("/calcbasket/:barcode", (req, res) => {
			let fruits = req.body.items.split(",");
			console.log(fruits); // This is an array
		});
	}
}