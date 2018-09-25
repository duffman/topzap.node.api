/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */


const express = require("express");

import { ProductModel }           from "@models/product-model";
import { DbManager }              from "@db/database-manager";
import { VendorModel }            from "@models/vendor-model";
import { VendorList }             from "@models/vendor-list";
import { SearchResult }           from "@models/search-result";
import { ProductBidModel }        from "@models/product-bid-model";
import { ProductBidList }         from "@models/product-bid-list";
import { Logger }                 from "../logger";

export class App {
	port = 8976;
	expressApp = express();
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		//this.init();
	}

	/**
	 *
	 * @param {string} barcode
	 * @returns {Promise<SearchResult>}
	 */
	public getProductOffers(barcode: string): Promise<SearchResult> {
		let result = new SearchResult();

		//
		// Get Product
		//
		function getProduct(barcode: string): Promise<ProductModel> {
			let sql = `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`

			console.log("GET THE FUCKING PRODUCT!!!");

			return new Promise((resolve, reject) => {
				return this.db.dbQuery(sql).then((dbRes) => {
					console.log(">>>>> 222");

					let dbRow = dbRes.safeGetFirstRow();

					console.log("GET TAAAA dscHE FUCKING PRODUCT!!!");


					let model = new ProductModel(
						dbRow.getValAsStr("id"),
						dbRow.getValAsStr("platform_name"),
						dbRow.getValAsStr("title"),
						dbRow.getValAsStr("publisher"),
						dbRow.getValAsStr("developer"),
						dbRow.getValAsStr("genre"),
						dbRow.getValAsStr("cover_image"),
						dbRow.getValAsStr("thumb_image"),
						dbRow.getValAsStr("video_source"),
						dbRow.getValAsStr("source"),
						dbRow.getValAsStr("release_date")
					);

					console.log("model", model);
					resolve(model);

				}).catch((error) => {
					console.log("ERROR:", error);
					reject(error);
				});
			});
		}

		//
		// Get Full Vendor List
		//
		function getVendors(): Promise<VendorList> {
			let result = new VendorList();
			let sql = `SELECT * FROM product_vendors`;

			return new Promise((resolve, reject) => {
				this.db.dbQuery(sql).then((dbRes) => {
					for (let i = 0; i < dbRes.result.rowCount(); i++) {
						let dbRow = dbRes.result.dataRows[i];

						let model = new VendorModel(
							dbRow.getValAsStr("id"),
							dbRow.getValAsStr("identifier"),
							dbRow.getValAsStr("vendor_type"),
							dbRow.getValAsStr("name"),
							dbRow.getValAsStr("description"),
							dbRow.getValAsStr("website_url"),
							dbRow.getValAsStr("logo_name"),
							""
						);

						result.addVendor(model);
					}

					resolve(result);

				}).catch((error) => {
					Logger.logError("Error Gettings Vendors", error);
					reject(error);
				});
			});
		}

		//
		// Get Bids
		//
		function getBidList(barcode: string): Promise<ProductBidList> {
			let result = new ProductBidList();
			let sql = `SELECT * FROM product_vendors`;

			return new Promise((resolve, reject) => {
				this.db.dbQuery(sql).then((dbRes) => {
					for (let i = 0; i < dbRes.result.rowCount(); i++) {
						let dbRow = dbRes.result.dataRows[i];

						let model = new ProductBidModel(
							dbRow.getValAsStr("id"),
							dbRow.getValAsStr("vendor_id"),
							dbRow.getValAsStr("product_id"),
							dbRow.getValAsStr("barcode"),
							dbRow.getValAsStr("buy_price"),
							dbRow.getValAsStr("sell_price")
						);

						result.addBid(model);
					}

					resolve(result);

				}).catch((error) => {
					Logger.logError("Error Gettings Vendors", error);
					reject(error);
				});
			});
		}

		///
		/// Compile the final search result
		///
		async function compileResult(): Promise<void> {
			let result = new SearchResult();

			try {
				console.log("Compile 1 -- Init");
				let product = await getProduct(barcode);
				console.log("Compile 2", product);
				let vendors = await getVendors();
				console.log("Compile 3", vendors);
				let bidList = await getBidList(barcode);
				console.log("Compile 4", bidList);

				result.setProduct(product);
				result.setVendorList(vendors);
				result.setBidList(bidList);
			}
			catch (ex) {
				result.setErrorMessage(ex.message);
			}
		}

		return new Promise<SearchResult>((resolve, reject) => {
			compileResult().then(() => {
				console.log("BULLE", result);
				resolve(result);
				Logger.logGreen("FUCK THE FUCKING FUCKER");
			});
		});
	}

	public test(barcode: string): Promise<SearchResult> {
		return new Promise<SearchResult>((resolve, reject) => {
			this.getProductOffers(barcode).then((result) => {
				resolve(result)
			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});
	}

	private init(): void {
		let model = {}; //new ProductModel("Kalle", "0345034543", "http://www.kalle.com/d.jpg");

		this.expressApp.get('/', (req, res)=>{
			/*this.getProductOffers("045496590451").then((searchResult) => {
				res.json(searchResult);
			});*/
		});

		this.expressApp.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}
}

let app = new App();

app.test("045496590451").then((result) => {
	console.log("RES", result);
});
