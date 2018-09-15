/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

const express = require("express");
const app = express();

export class App {
	constructor() {
		console.log("App started");
		init();
	}

	private init(): void {
		var model

		app.get('/api/offer', (req, res)=>{


			res.json()
		});

		app.listen(3000);
		console.log('Listening on localhost:3000');

	}

}

let app = new App();
