/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { DataFieldRow }           from "@putteDb/data-row";
import { SQLTableDataRow }        from "@putteDb/sql-table-data-row";

export class VendorModel {
	constructor(
		public id: string,
		public identifier: string,
		public vendorType: string,
		public name: string,
		public description: string,
		public websiteUrl: string,
		public logoName: string,
		public logoUrl: string) {}
}