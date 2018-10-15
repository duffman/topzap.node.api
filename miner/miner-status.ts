/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { DbManager }              from "@db/database-manager";
import {DynSQL} from "@db/dynsql/dynsql";
import {Logger} from "../logger";
import {IDbResult} from "@db/db-result";

export class MinerStatus {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
	}

	public getSessionInfo(): Promise<IDbResult> {
		let dynSql = new DynSQL();

		let sql = dynSql.select("ms.id", "ms.session_key", "ms.completed", "pv.name")
			.from("price_miner_session", "ms")
			.from("product_vendors", "pv")
			.where(
				"pv.id", "ms.vendor_id"
			).toSQL();

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then((dbRes) => {
				resolve(dbRes);
			}).catch((error) => {
				Logger.logError("getMinerSession :: error ::", error);
				reject(error);
			});
		});
	}

	public getProgressInfo(): Promise<IDbResult> {
		let scope = this;

		/*
		function execSql(sql: string): Promise<IDbResult> {
			return new Promise((resolve, reject) => {
				return this.db.dbQuery(sql).then((dbRes) => {
					resolve(dbRes);
				}).catch((error) => {
					Logger.logError("getMinerSession :: error ::", error);
					reject(error);
				});
			});
		}*/

		function getSessionDbRes(): Promise<IDbResult> {
			return new Promise((resolve, reject) => {
				return scope.getSessionInfo();
			});
		}

		function getSessionData(sessionId: number): Promise<IDbResult> {
			let sql = `SELECT (SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId}) AS total,
			(SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId} AND processed_when IS NOT NULL AND price > -1) AS sucessCount,
			(SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId} AND processed_when IS NOT NULL) AS processedCount`;

			return new Promise((resolve, reject) => {
				return this.db.dbQuery(sql).then((dbRes) => {
					resolve(dbRes);
				}).catch((error) => {
					Logger.logError("getMinerSession :: error ::", error);
					reject(error);
				});
			});
		}

		async function getInfo(): Promise<void> {
			let sessionInfo = await getSessionDbRes();

			for (let i = 0; i < sessionInfo.result.rowCount(); i++) {

			}
		}

		return new Promise((resolve, reject) => {
			getInfo().then(() => {
				resolve(null);
			})
		});
	}

}