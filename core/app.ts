/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */


const express = require("express");

import * as Promise               from "bluebird";
import { ProductModel }           from "@models/product-model";
import { DbManager }              from "@db/database-manager";
import { VendorModel }            from "@models/vendor-model";
import { VendorList }             from "@models/vendor-list";
import { SearchResult }           from "@models/search-result";
import { ProductBidModel }        from "@models/product-bid-model";
import { ProductBidList }         from "@models/product-bid-list";
import { Logger }                 from "../logger";

export class App {
	port = 8080;
	expressApp = express();
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		this.init();
	}

	//
	// Get Product
	//
	private getProduct(barcode: string): Promise<ProductModel> {
		let sql = `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let dbRow = dbRes.safeGetFirstRow();

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
	private getVendors(): Promise<Array<VendorModel>> {
		let result = new Array<VendorModel>();
		let sql = `SELECT * FROM product_vendors`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
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

					result.push(model);
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
	private getBidList(barcode: string): Promise<Array<ProductBidModel>> {
		let result = new Array<ProductBidModel>();
		let sql = `SELECT * FROM product_bid WHERE barcode='${barcode}'`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
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

					result.push(model);
				}

				resolve(result);

			}).catch((error) => {
				Logger.logError("Error Gettings Vendors", error);
				reject(error);
			});
		});
	}

	/**
	 *
	 * @param {string} barcode
	 * @returns {Promise<SearchResult>}
	 */
	public getProductOffers(barcode: string): Promise<SearchResult> {
		let result = new SearchResult();

		///
		/// Compile the final search result
		///
		return new Promise((resolve, reject) => {
			return this.getProduct(barcode).then((product) => {
				result.setProduct(product);

				return this.getVendors().then((vendors) => {
					return vendors;
				});

			}).then((vendorArray) => {
				result.vendors = vendorArray;   //.setVendorList(vendorList);

				return this.getBidList(barcode).then((bids) => {
					return bids;
				});

			}).then((bidsArray) => {
				result.bids = bidsArray; //setBidList(bidsList);

				resolve(result);
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
		this.expressApp.get('/barcode/:code', (req, res) => {
			let reqCode = req.params.code;
			Logger.logGreen("Looking up Barcode:", reqCode);

			this.getProductOffers(reqCode).then((result) => {
				if (result.product != null)
					Logger.logGreen("Product found:", result.product.title);

				res.json(result);

			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});

		this.expressApp.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}
}

let app = new App();

/*
app.test("045496590451").then((result) => {
	console.log(JSON.stringify(result));
});
*/