/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */


import * as Promise               from "bluebird";
import { DbManager }              from "@db/database-manager";
import { ProductModel }           from "@models/product-model";
import { VendorList }             from "@models/vendor-list";
import { ProductBidList }         from "@models/product-bid-list";
import { VendorModel }            from "@models/vendor-model";
import { ProductBidModel }        from "@models/product-bid-model";
import { SearchResult }           from "@models/search-result";
import { PlatformTypeParser }     from "@utils/platform-type-parser"
import { GLog }                   from "../zap-log";
import { Logger }                 from "../logger";


export class ProductDb {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		this.init();
	}

	private init() {}

	//
	// Get Product
	// - extended adds pltform image info
	//
	private getProduct(barcode: string, extended: boolean): Promise<ProductModel> {
		let sql = `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let dbRow = dbRes.safeGetFirstRow();

				let gameTitle = dbRow.getValAsStr("title");
				let platformName = dbRow.getValAsStr("platform_name");

				let model = new ProductModel(
					dbRow.getValAsStr("id"),
					platformName,
					gameTitle,
					dbRow.getValAsStr("publisher"),
					dbRow.getValAsStr("developer"),
					dbRow.getValAsStr("genre"),
					dbRow.getValAsStr("cover_image"),
					dbRow.getValAsStr("thumb_image"),
					dbRow.getValAsStr("video_source"),
					dbRow.getValAsStr("source"),
					dbRow.getValAsStr("release_date")
				);

				//
				// Add extended properties
				//
				if (extended) {
					GLog.logYellow("Adding extended properties to:", gameTitle);
					let gpp = new PlatformTypeParser();
					model.platformIcon = gpp.parseFromName(platformName, true);
					model.platformImage = gpp.parseFromName(platformName, false);

					GLog.logCyan("Model", model);
				}

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
	public getProductOffers(barcode: string, extendedProdData: boolean): Promise<SearchResult> {
		let result = new SearchResult();

		///
		/// Compile the final search result
		///
		return new Promise((resolve, reject) => {
			return this.getProduct(barcode, extendedProdData).then((product) => {
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
} 