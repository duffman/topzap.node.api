/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

const express = require("express");

import * as Promise               from "bluebird";
import { DbManager }              from "@db/database-manager";
import { SearchResult }           from "@models/search-result";
import { Logger }                 from "../logger";
import { ProductDb }              from "@core/../product-api/product-db";
import { MinerServerApi }            from "@miner/miner-api";

let bodyParser = require("body-parser");

export class App {
	port = 8080;
	expressApp = express();
	db: DbManager;

	productDb: ProductDb;
	minerServ: MinerServerApi;

	constructor(public minerApi: boolean = false) {
		this.db = new DbManager();
		this.productDb = new ProductDb();
		this.minerServ = new MinerServerApi();
		this.init();
	}

	public test(barcode: string): Promise<SearchResult> {
		return new Promise<SearchResult>((resolve, reject) => {
			this.productDb.getProductOffers(barcode, false).then((result) => {
				resolve(result)
			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});
	}

	/**
	 * Initialize The Express Web Server
	 */
	private init(): void {
		let app = this.expressApp;

		// set the view engine to ejs
		app.set('view engine', 'ejs');

		//app.use(bodyParser.json()); // support json encoded bodies
		app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		});


		app.get('/minerstats', function(req, res) {
			res.render('pages/minerstats', {data: "Kalle Kula"});
		});

		// TODO: MOVE TO NGINX
		// Get Static file
		//
		app.use(express.static('public'));

		app.get('/res/:filename', (req, res) => {
			let filename = req.params.code;
			console.log("Get file", filename);
		});

		//
		// Get Product by Barcode
		//
		let extendedProdData = true;

		app.get('/barcode/:code', (req, res) => {
			let reqCode = req.params.code;
			Logger.logGreen("Looking up Barcode:", reqCode);

			this.productDb.getProductOffers(reqCode, extendedProdData).then((result) => {
				if (result.product != null)
					Logger.logGreen("Product found:", result.product.title);

				res.json(result);

			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});

		//
		// Miner Api Endpoint
		//
		if (this.minerApi) {
			this.minerServ.init(app);
		}

		app.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}
}

let minerApi = true;
let app = new App(minerApi);

/*
app.test("045496590451").then((result) => {
	console.log(JSON.stringify(result));
});
*/
