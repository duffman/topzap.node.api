/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * Note: This whole thing WILL be replaced with DI when moved to an own project
 */
import { ContentFactory } from "@app/cms/content-factory";

export class PageManager {
	contectFactory: ContentFactory;

	constructor() {
		this.contectFactory = new ContentFactory
	}



	public getPageByName(contentName: string): Promise<IPa> {
		return new Promise((resolve, reject) => {
			this.adminiContentDb.getContentByName(contentName).then((res) => {
				console.log("GET CONTENT BY NAME ::", res.)
			});
		});
	}


	public getPageByName(contentName: string): Promise<ICMSContent> {
		return new Promise((resolve, reject) => {
			this.adminiContentDb.getContentByName(contentName).then((res) => {
				console.log("GET CONTENT BY NAME ::", res.)
			});
		});
	}

}