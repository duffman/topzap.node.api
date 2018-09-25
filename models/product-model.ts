/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import {DataFieldRow} from "@db/data-row";
import {SQLTableDataRow} from "@db/sql-table-data-row";

export class ProductModel {
	// Extended properties
	public platformIcon: string;
	public platformImage: string;

	constructor(
		public id: string,
		public platformName: string,
		public title: string,
		public publisher: string,
		public developer: string,
		public genre: string,
		public coverImage: string,
		public thumbImage: string,
		public videoSource: string,
		public source: string,
		public releaseDate: string) {}
}