/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { DbManager }              from "@putteDb/database-manager";
import { DynSQL }                 from "@putteDb/dynsql/dynsql";
import { ICMSContent }            from "@cms/cms-content";
import { Logger }                 from "@cli/logger";
import { IDbResult}               from "@putteDb/db-result";

export class AdminiContentDb {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		this.init();
	}

	private init() {
	}

	public getContentByName(contentId: string): Promise<IDbResult> {
		return new Promise((resolve, reject) => {
		});
	}

	public getContentById(contentId: number): Promise<IDbResult> {
		let dynSql = new DynSQL();
		dynSql.select("");

		return new Promise((resolve, reject) => {
			let sql = dynSql.toSQL();

			this.db.dbQuery(sql).then((dbRes) => {
				resolve(dbRes);
			}).catch((err) => {
				reject(err);
				Logger.logError("AdminiContentDb :: getContent ::", err);
			});
		});
	}
}