import { ProductModel } from "@models/product-model";
import { DbManager } from "@db/database-manager";
import {IDbResult} from "@db/db-result";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

const express = require("express");

export class App {
	port = 8976;
	expressApp = express();
	db: DbManager;

	constructor() {
		this.db = new DbManager();

		this.init();
	}


	private getProduct(barcode: string) {
		let sql = `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`
		this.db.dbQuery(sql).then((dbRes) => {
			for (let i = 0; i < dbRes.result.rowCount(); i++) {
				let row = dbRes.result.dataRows[i];
				console.log("ROW:", row);
			}
		}).catch((error) => {
			console.log("ERROR:", error);
		});

		console.log("App started");

	}


	private init(): void {
		this.getProduct("045496590444");

		let model = new ProductModel("Kalle", "0345034543", "http://www.kalle.com/d.jpg");

		this.expressApp.get('/api/offer', (req, res)=>{
			res.json(model);

		});

		this.expressApp.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}

}

let app = new App();
