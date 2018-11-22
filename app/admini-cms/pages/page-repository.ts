/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * Note: This whole thing WILL be replaced with DI when moved to an own project
 */

import { ICMSContent }            from "@cms/cms-content";
import { ICMSPageData }           from "@cms/pages/page-data";
import { PageData }               from "@cms/pages/page-data";
import { AdminiContentDb }        from "@cms/db/admini-content-db";
import { AdminiDb }               from "@cms/db/admini-db";
import { ContentFactory }         from "@cms/content-factory";

export class PageManager {
	contectFactory: ContentFactory;
	adminiDb: AdminiDb;
	adminiContentDb = new AdminiContentDb();

	constructor() {
		this.contectFactory = new ContentFactory();
		this.adminiDb = new AdminiDb();
		this.adminiContentDb = new AdminiContentDb();

	}

	public getPageById(contentId: number): Promise<ICMSPageData> {
		let result = new PageData();

		return new Promise((resolve, reject) => {
			this.adminiContentDb. getContentById(contentId).then((res) => {
				console.log("GET CONTENT BY NAME ::", res)
			});
		});
	}


	public getPageByName(contentName: string): Promise<ICMSContent> {
		return new Promise((resolve, reject) => {
			this.adminiContentDb.getContentByName(contentName).then((res) => {
				console.log("GET CONTENT BY NAME ::", contentName)
			});
		});
	}

}