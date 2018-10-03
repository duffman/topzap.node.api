/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import * as Promise               from "bluebird";
import { DbManager }              from "@db/database-manager";
import { GLog }                   from "../zap-log";
import { Logger }                 from "../logger";
import { IMinerWorkItem }         from "@miner/miner-session-model";
import { MinerWorkItemSlim }      from "@miner/miner-session-model";
import { MinerWorkItemUpdate }    from "@miner/miner-session-model";
import { MinerSessionModel}       from "@miner/miner-session-model";
import { IDbResult }              from "@db/db-result";
import { Guid }                   from "@utils/session-guid";
import {DynSQL} from "@db/dynsql/dynsql";

export class MinerDb {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		this.init();
	}

	private init() {}

	public haveMinerSession(vendorId: Number): Promise<boolean> {
		let sql = `SELECT count(*) AS count FROM price_miner_session WHERE vendor_id=${vendorId}`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let dbRow = dbRes.safeGetFirstRow();
				let haveSession = dbRow.getValAsInt("count") > 0;

				resolve(haveSession);

			}).catch((error) => {
				Logger.logError("getMinerSession :: error ::", error);
				reject(error);
			});
		});
	}

		//
	// Get Product
	// - extended adds pltform image info
	//

	public getWorkQueue(sessionId: number, size: number = -1): Promise<Array<MinerWorkItemSlim>> {
		let sql = `SELECT * FROM price_miner_queue WHERE session_id=${sessionId} AND processed_when IS NULL`;  //SELECT * FROM price_miner_queue vendor_id=${sessionId} AND processed_when IS NULL`;
		if (size > -1) {
			sql = sql + ` LIMIT ${size}`
		}

		console.log("SQL", sql);

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let result = new Array<IMinerWorkItem>();

				for (let i = 0; i < dbRes.result.rowCount(); i++) {
					let dbRow = dbRes.result.dataRows[i];

					/*
					let model = new MinerWorkItem(
						dbRow.getValAsInt("id"),
						dbRow.getValAsInt("session_id"),
						dbRow.getValAsStr("barcode"),
						dbRow.getValAsStr("price"),
						dbRow.getValAsStr("processed_when")
					);
					*/

					let model = new MinerWorkItemSlim(
						dbRow.getValAsInt("id"),
						dbRow.getValAsStr("barcode")
					);

					result.push(model);
				}

				resolve(result);

			}).catch((error) => {
				Logger.logError("getWorkQueue :: error ::", error);
				reject(error);
			});
		});
	}

	/**
	 * Update a work queue entry with price and date from a given id
	 * @param {number} id
	 * @param {number} price
	 * @returns {<boolean>}
	 */
	public updateWorkQueue(item: MinerWorkItemUpdate): Promise<IDbResult> {
		let dynQuery = new DynSQL();
		dynQuery.update("price_miner_queue");
		dynQuery.set("accepted", item.accepted);
		dynQuery.set("price", item.price);
		dynQuery.set("processed_when", item.price, false);
		dynQuery.set("message", item.message);
		dynQuery.where("price_miner_queue.id", item.id)

		console.log("dynQuery ::", dynQuery.toSQL());

		let sql = `UPDATE price_miner_queue SET `
			+ `accepted=${item.accepted}, `
			+ `price='${item.price}', `
			+ `processed_when=NOW(), `
			+ `message='${item.message}', `
			+ `WHERE id=${item.id}`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				resolve(dbRes);
			}).catch((error) => {
				reject(error)
			})
		});
	}

	public getMinerSession(vendorId: Number): Promise<MinerSessionModel> {
		let sql = `SELECT * FROM price_miner_session WHERE vendor_id=${vendorId} AND completed=0`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let dbRow = dbRes.safeGetFirstRow();

				console.log("dbRow", dbRow);

				if (dbRow.count() > 0) {
					let model = new MinerSessionModel(
						dbRow.getValAsInt("id"),
						dbRow.getValAsStr("session_key"),
						dbRow.getValAsStr("miner_name"),
						dbRow.getValAsStr("created"),
						dbRow.getValAsInt("vendor_id"),
						dbRow.getValAsInt("completed")
					);

					resolve(model);

				} else {
					resolve(new Error("Empty result set"))					;
				}
			}).catch((error) => {
				Logger.logError("getMinerSession :: error ::", error);
				reject(error);
			});
		});
	}

	//
	// Create Miner Session
	//
	public createMinerSession(vendorId: Number, minerName: string = "<noname>"): Promise<IDbResult> {
		let sql = `INSERT INTO price_miner_session (session_key, vendor_id, miner_name, created) `
					+ `VALUES ("${Guid.newGuid()}", ${vendorId}, "${minerName}", NOW())`;

		console.log("SQL", sql);

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				resolve(dbRes);
			}).catch((error) => {
				Logger.logError("Error Gettings Vendors", error);
				reject(error);
			});
		});
	}

	//
	// Create Miner Work Queue
	//
	public createMinerQueue(sessionId: Number): Promise<boolean> {
		let sql = `INSERT INTO price_miner_queue (session_id, barcode) SELECT ${sessionId}, barcode FROM product_edition`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				let success = dbRes.affectedRows > 0;
				resolve(success);
			}).catch((error) => {
				Logger.logError("Error Gettings Vendors", error);
				reject(error);
			});
		});
	}
}
