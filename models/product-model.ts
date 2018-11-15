/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

export class ProductModel {
	// Extended properties
	public platformIcon: string;
	public platformImage: string;

	constructor(
		public id: string = null,
		public platformName: string = null,
		public title: string = null,
		public publisher: string = null,
		public developer: string = null,
		public genre: string = null,
		public coverImage: string = null,
		public thumbImage: string = null,
		public videoSource: string = null,
		public source: string = null,
		public releaseDate: string = null
	) {}
}