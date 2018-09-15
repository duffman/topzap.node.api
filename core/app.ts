import { ProductModel } from "@Db/models/product-model";
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

	constructor() {
		console.log("App started");
		this.init();
	}

	private init(): void {
		let model = new ProductModel("Kalle", "0345034543", "http://www.kalle.com/d.jpg");

		this.expressApp.get('/api/offer', (req, res)=>{
			res.json(model);
		});

		this.expressApp.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);

	}

}

let app = new App();
