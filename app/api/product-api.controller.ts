/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Express, Router }        from "express";
import { Request, Response }      from "express";
import { IApiController }         from "@api/api-controller";
import { ProductDb }              from "@db/product-db";
import { ProductModel }           from "@models/product-model";
import { Logger }                 from "@cli/cli.logger";

export class ProductApiController implements IApiController {
	productDb: ProductDb;

	constructor() {
		this.productDb = new ProductDb();
	}

	public getProduct(barcode: string): Promise<ProductModel> {
		return new Promise((resolve, reject) => {
			this.productDb.getProduct(barcode).then((res) => {
				resolve(res);
				Logger.log("getProduct ::", res);
			}).catch((err) => {
				Logger.logError("ProductApiController :: getProduct :: error ::", err);
				reject(err);
			});
		});
	}

	public initRoutes(routes: Router) {
		let scope = this;

		routes.get("/kalle/:code", (req: Request, resp: Response) => {
			console.log(":: KALLE ::");
			resp.json({kalle: "kula"});
		});

		routes.post("/prod/:code", (req: Request, resp: Response) => {
			let code = req.params.code;
		});

		//
		// Get product info
		//
		routes.post("/prod", (req: Request, resp: Response) => {
			let code = req.body.code;

			console.log("CODE :: ", code);

			scope.getProduct(code).then((prodResult) => {
				Logger.log("ProductApiController :: getProduct ::", prodResult);

				console.log("KKKKK ::", JSON.stringify(prodResult))

				resp.json(prodResult);

			}).catch((err) => {
				Logger.logError("ProductApiController :: error ::", err);
				resp.json({
					result: "fail",
					errorCode: 6667
				});
			});
		});

		routes.get("/prod/:code", (req: Request, resp: Response) => {
			let code = req.params.code;

			console.log("CODE :: ", code);

			scope.getProduct(code).then((prodResult) => {
				Logger.log("ProductApiController :: getProduct ::", prodResult);

				console.log("KKKKK ::", JSON.stringify(prodResult))

				resp.json(prodResult);

			}).catch((err) => {
				Logger.logError("ProductApiController :: error ::", err);
				resp.json({
						result: "fail",
						errorCode: 6667
					});
			});
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
