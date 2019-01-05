/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IDbController }          from '@db/db.controller';
import { DbManager }              from '@putteDb/database-manager';
import {Logger} from '@cli/cli.logger';

export class AnalyticsDb implements IDbController {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
	}

	/**
	 * Push new Zap, increase counter
	 * @param {string} code
	 */
	public doZap(code: string): Promise<boolean> {
		let scope = this;
		let result = false;

		/*
		function haveItem(): Promise<boolean> {
			let sql = `SELECT COUNT(*) AS count FROM zap-counter WHERE code='${code}'`;
			return new Promise((resolve, reject) => {
				scope.db.dbQuery(sql).then(res => {
					let row res
				});
			});
		}
		*/

		function updateRow(): Promise<boolean> {
			let sql = `UPDATE zap-counter SET zaps=zaps+1 WHERE code='${code}'`;
			return new Promise((resolve, reject) => {
				scope.db.dbQuery(sql).then(res => {
					resolve(true);
				}).catch(err => {
					// Do not throw, just resolve and forget
					resolve(false);
				});
			});
		}

		function addRow(): Promise<boolean> {
			let sql = `INSERT INTO zap-counter (code, zaps,	last_zap) VALUES ('${code}', 1, CURRENT_TIMESTAMP)`;
			return new Promise((resolve, reject) => {
				scope.db.dbQuery(sql).then(res => {
					resolve(true);
				}).catch(err => {
					// Do not throw, just resolve and forget
					resolve(false);
				});
			});
		}


		async function execute(): Promise<void> {
			let count = await this.db.countRows("zap-counter", "code", `='${code}'`);
			try {
				if (count > 0) {
					await updateRow();
				} else {
					await addRow();
				}
			} catch (err) {
				Logger.logError("AnalyticsDb :: doZap ::", err);
				result = false;
			}
		}

		return new Promise((resolve, reject) => {
			execute().then(() => {
				resolve(result);
			});
		});
	}
}