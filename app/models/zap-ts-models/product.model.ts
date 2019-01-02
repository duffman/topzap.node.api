/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

export interface IProductData {
	id?:            number;
	code:           string;
	platformName?:  string;
	title?:         string;
	publisher?:     string;
	developer?:     string;
	genre?:         string;
	coverImage?:    string;
	thumbImage?:    string;
	videoSource?:   string;
	source?:        string;
	releaseDate?:   string;
	platformIcon?:  string;
	platformImage?: string;
}

export class ProductData implements IProductData {
	constructor(
		public id:            number = -1,
		public code:          string = '',
		public platformName:  string = '',
		public title:         string = '',
		public publisher:     string = '',
		public developer:     string = '',
		public genre:         string = '',
		public coverImage:    string = '',
		public thumbImage:    string = '',
		public videoSource:   string = '',
		public source:        string = '',
		public releaseDate:   string = '',
		public platformIcon:  string = '',
		public platformImage: string = '',
	) {}
}

export namespace Convert {
	export function toProductData(json: string): IProductData {
		return JSON.parse(json);
	}

	export function productDataToJson(value: IProductData): string {
		return JSON.stringify(value);
	}
}
