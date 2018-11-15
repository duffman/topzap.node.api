/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import {MinerStatus} from "@miner/miner-status";

//const express = require("express");
//let bodyParser = require("body-parser");

import * as express               from "express";
import * as bodyParser            from "body-parser";
import * as cookieParser          from "cookie-parser";
import { DbManager }              from "@db/database-manager";
import { SearchResult }           from "@models/search-result";
import { Logger }                 from "@cli/logger";
import { ProductDb }              from "../db/product-db";
import { MinerServerApi }         from "@api/miner-api";
import {BarcodeParser} from "@zaplib/barcode-parser";


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
			this.productDb.getProductOffers(barcode, false,false).then((result) => {
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

		app.use(cookieParser());
		app.use(bodyParser.json()); // support json encoded bodies
		app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		});


		app.get('/minerstats', function(req, res) {
			let stat = new MinerStatus();
			stat.getProgressInfo().then((data) => {
				console.log(data);
				res.render('pages/minerstats', {progData: data});
			});
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

		app.post('/barcode', (req, res) => {
			// /:code
			let data = req.body;


			let reqCode = data.ean; //  req.params.code;
			let fullResult = !data.cache;
			let debug = data.debug;

			Logger.logGreen("Given Barcode:", data);

			reqCode = BarcodeParser.prepEan13Code(reqCode, true);

			Logger.logGreen("Prepared Barcode:", reqCode);

			this.productDb.getProductOffers(reqCode, fullResult, extendedProdData, debug).then((result) => {
				if (result.product != null) {
					Logger.logGreen("Product found:", result.product.title);
					res.json(result);
				} else {
					res.json(new Error("Not found"));
				}


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
