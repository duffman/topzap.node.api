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

//import * as Promise from "bluebird";
import { IConnection }            from "mysql";
import { ISqlDataModel, SQLTableData } from "./sql-table-data";
import { SQLTableDataRow }          from "./sql-table-data-row";
import { isUndefined } from "util";

export interface IDbResult {
	success: boolean;
	lastInsertId: number;
	result: ISqlDataModel;
	rawObj: {};
	safeGetFirstRow(): SQLTableDataRow;
}

export class DbResult implements IDbResult {
	public success: boolean = true;
	public error: any = null;
	public lastInsertId: number = 0;
	public affectedRows: number;
	public rawObj: {};

	constructor(
		public result: ISqlDataModel = null
	){
		this.setRawObj();
	}

	public errorMessage(): string {
		return "";
	}

	/**
	 * Store a raw JavaScript object representation of the data
	 * TODO: Clean up this hack!!
	 */
	private setRawObj(): void {
		if (this.result == null || this.result[0] == null)
			return;

		let obj = this.result[0];
		let empty = {};

		for (let key in obj) {
			if (obj.hasOwnProperty(key) ) {
				let camelKey = key; //PascalSnake.toPascalCase(key, true);
				empty[camelKey] = obj[key];
			}
		}

		this.rawObj = empty;
	}

	/**
	 * Always return a SQLTableDataRow
	 * If a SQLTableData result is present containing
	 * one or more rows, the first row will be returned
	 * otherwize a new SQLTableDataRow will be created.
	 */
	public safeGetFirstRow(): SQLTableDataRow {
		let tableDataRow: SQLTableDataRow;
		let isObj = this.result != null && !isUndefined(this.result);
		let isTableData = this.result instanceof SQLTableData;

		if (isObj && isTableData && this.result.dataRows.length > 0) {
			tableDataRow = this.result.getFirstRow()
		} else {
			tableDataRow = new SQLTableDataRow();
		}

		return tableDataRow;
	}
}