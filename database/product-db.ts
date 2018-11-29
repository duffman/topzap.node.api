/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { DbManager }              from "@putteDb/database-manager";
import { SQLTableDataRow }        from "@putteDb/sql-table-data-row";
import { Logger }                 from "@cli/cli.logger";
import { ProductModel }           from "@models/product-model";
import { VendorModel }            from "@models/vendor-model";
import { ProductBidModel }        from "@models/product-bid-model";
import { SearchResult }           from "@models/search-result";
import { PlatformTypeParser }     from "@utils/platform-type-parser"
import { PStrUtils }              from "@putte/pstr-utils";
import {CliCommander} from "@cli/cli.commander";

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
	public getProduct(barcode: string, extended: boolean = true, debug: boolean = false): Promise<ProductModel> {
		function generateSql(): string {
			if (!debug) {
				return `SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`;
			} else {
				return `SELECT games.* FROM games, product_edition AS edition WHERE games.id = edition.game_id ORDER BY RAND() LIMIT 1`;
			}
		}

		let sql = generateSql();

		Logger.logGreen("SQL ::", sql);

		function createProductModel(dbRow: SQLTableDataRow): ProductModel {
			if (dbRow.isEmpty) {
				return new ProductModel();
			} else {
				return new ProductModel(
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
			}
		}

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let dbRow = dbRes.safeGetFirstRow();

				let model = createProductModel(dbRow);
				let havePlatformAndTitle = !PStrUtils.isEmpty(model.platformName) && !PStrUtils.isEmpty(model.title);

				//
				// Add extended properties
				//
				if (extended && !dbRow.isEmpty && havePlatformAndTitle) {
					Logger.logYellow("Adding extended properties to:", model.title);
					let gpp = new PlatformTypeParser();
					model.platformIcon = gpp.parseFromName(model.title, true);
					model.platformImage = gpp.parseFromName(model.platformName, false);

					Logger.logCyan("getProduct() :: Model", model);
				}

				resolve(model);

			}).catch((error) => {
				Logger.logError("getProduct() :: error ::", error);
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
	 * @param {boolean} fullResult
	 * @param {boolean} extendedProdData
	 * @param {boolean} debug
	 * @returns {Promise<SearchResult>}
	 */
	public getProductOffers(barcode: string,
							includeVendors: boolean,
							extendedProdData: boolean,
							debug: boolean = false): Promise<SearchResult> {
		let scope = this;
		let result = new SearchResult();

		function getProductInfo(): Promise<ProductModel> {
			return this.getProduct(barcode, extendedProdData, debug);
		}

//		getBidList(barcode: string): Promise<Array<ProductBidModel>>

		function getVendors(): Promise<VendorModel[]> {
			if (includeVendors) {
				return this.getVendors;

			} else {

			}
		}

		async function execute(): Promise<void> {
			let product = await scope.getProduct(barcode, extendedProdData, debug);



		}

		///
		/// Compile the final search result
		///
		return new Promise((resolve, reject) => {
			return execute().then(() => {
				resolve(result)
			}).catch((err) => {
				reject(err);
			});

			/*

			return this.getProduct(barcode, extendedProdData, debug).then((product) => {
				result.setProduct(product);



			}).then((vendorArray) => {
				result.vendors = vendorArray;

				return this.getBidList(barcode).then((bids) => {
					return bids;
				});
			}).then((bidsArray) => {
				result.bids = bidsArray; //setBidList(bidsList);

				resolve(result);
			});*/
		});
	}
}

if (CliCommander.debug()) {
	console.log("DEBUG!");
	let debug = new ProductDb();
	debug.getProduct("0819338020068").then((res) => {
		console.log("ProductDb ::", res);
	}).catch((err) => {
		console.log("ProductDb :: err", err);
	});

} else {
	console.log("NO DEBUG!");
}
