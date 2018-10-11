/**
 * COLDMIND LTD ("COMPANY") CONFIDENTIAL
 * Unpublished Copyright (c) 2015-2017 COLDMIND LTD, All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains the property of COMPANY. The intellectual and technical concepts contained
 * herein are proprietary to COMPANY and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from COMPANY.  Access to the source code contained herein is hereby forbidden to anyone except current COMPANY employees, managers or contractors who have executed
 * Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 * The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 * information that is confidential and/or proprietary, and is a trade secret, of  COMPANY.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 * OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 * LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 * Created by Patrik Forsberg on 2017
 */

import * as mysql                 from "mysql";
import { DataSheet }              from "./data-sheet";
import { SQLTableData }           from "./sql-table-data";
import { IDbResult }              from "./db-result";
import { DbResult }               from "./db-result";
import { isNullOrUndefined }      from "util";
import { Global }                 from "../global";
import { Logger }                 from "../logger";

const log = console.log;


export interface IOkPacket {
	fieldCount: number;
	affectedRows: number;
	insertId: number;
	serverStatus: number;
	warningCount: number;
	message: string;
	protocol41: boolean;
	changedRows: number;
}

export interface IQuerySheetCallback {
	(sheet: DataSheet);
}

export class DbManager {
	connection: any;

	constructor (public dbHost: string = Global.Settings.Database.dbHost,
				 public dbUser: string = Global.Settings.Database.dbUser,
				 public dbPass: string = Global.Settings.Database.dbPass,
				 public dbName: string = Global.Settings.Database.dbName) {

		this.connection = mysql.createConnection({
			host: dbHost,
			user: dbUser,
			password: dbPass,
			database: dbName
		});
	}

	public static getInstance(): DbManager {
		let dbManager = new DbManager();
		dbManager.open();
		return dbManager;
	}

	public open() {
		this.connection.connect();
	}

	public close() {
		this.connection.end();
	}

	public query(sql: string, callback: IQuerySheetCallback): void {
		let dataSheet: DataSheet = new DataSheet();

		this.connection.connect();

		this.connection.query(sql, (error: any, result: any, fields: any) => {
			this.connection.end();
			if (error) throw error;

			dataSheet.parseFields(fields);
			callback(dataSheet);
		});
	}

	public static escape(value: string): string {
		if (isNullOrUndefined(value))
			value = '';

		value = value.replace('"', '\"');
		value = value.replace("'", '\"');
		return value;
	}

	public static mysqlRealEscapeString(str: string): string {
		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
			switch (char) {
				case "\0":
					return "\\0";
				case "\x08":
					return "\\b";
				case "\x09":
					return "\\t";
				case "\x1a":
					return "\\z";
				case "\n":
					return "\\n";
				case "\r":
					return "\\r";
				case "\"":
				case "'":
				case "\\":
				case "%":
					return "\\" + char; // prepends a backslash to backslash, percent,
										// and double/single quotes
			}
		});
	}

	private parseMysqlQueryResult(error, result, tableFields): Promise<IDbResult> {
		return new Promise((resolve, reject) => {
			let queryResult = new DbResult();

			if (error) {
				queryResult.success = false;
				queryResult.error = error;

				if (error.errno == 1062) {
					//log("** Duplicate entry")
				} else {
					Logger.logErrorMessage("dbQuery :: Error ::", error.errno);
				}

				//reject(error);
				resolve(queryResult);
				return;
			} else {
				queryResult.affectedRows = result.affectedRows;
				queryResult.lastInsertId = result.insertId;

				let data = new SQLTableData();
				data.parseResultSet(result, tableFields).then((res) => {
					queryResult.result = res;
					resolve(queryResult);
				}).catch((err) => {
					reject(err);
				});
			}
		});
	}

	public runInTransaction(sql: string): Promise<IDbResult> {
		let scope = this;
		let result: IDbResult;
		let executeError: Error = null;

		function beginTransaction(): Promise<IOkPacket> {
			return new Promise((resolve, reject) => {
				scope.connection.query("START TRANSACTION", (error, result) => {
					if (!error) {
						resolve(result);
					}
					else {
						reject(error);
					}
				});
			});
		}

		function executeSql(sql: string): Promise<IDbResult> {
			return new Promise((resolve, reject) => {
				scope.connection.query(sql, (error, result, tableFields) => {
					scope.parseMysqlQueryResult(error, result, tableFields).then((res) => {
						resolve(res);
					}).catch((err) => {
						reject(err);
					});
				});
			});
		}

		function commit(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				scope.connection.query("COMMIT", (error, result) => {
					console.log("error ::", error);
					console.log("result ::", result);
					if (!error) {
						resolve(result);
					}
					else {
						reject(error);
					}
				});
			});
		}

		function rollback(): Promise<boolean> {
			return new Promise((resolve, reject) => {
				scope.connection.query("ROLLBACK", (error, result) => {
					console.log("error ::", error);
					console.log("result ::", result);
					if (!error) {
						resolve(result);
					}
					else {
						reject(error);
					}
				});
			});
		}

		async function execute(): Promise<void> {
			let beginTransRes = await beginTransaction();

			try {
				result = await executeSql(sql);
				await commit();

			} catch(err) {
				let transError  = err != null ? err : new Error("SQL Execution failed");
				executeError = transError;
			}

			if (executeError != null || !result.success) {
				await rollback();
			}
		}

		return new Promise((resolve, reject) => {
			execute().then(() => {
				if (executeError != null) {
					reject(executeError)
				}
				else {
					resolve(result);
				}
			});
		});
	}

	public dbQuery(sql: string): Promise<IDbResult> {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, (error, result, tableFields) => {
				this.parseMysqlQueryResult(error, result, tableFields).then((res) => {
					resolve(res);
				}).catch((err) => {
					reject(err);
				});
			});
		});
	}
}