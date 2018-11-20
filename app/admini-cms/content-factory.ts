/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * @author Patrik Forsberg
 * @date 2018-11-20
 *
 */
import { AdminiDb }               from "@cms/db/admini-db";
import { AdminiContentDb }        from "@cms/db/admini-content-db";
import { ICMSContent }            from "@cms/cms-content";
import {Logger} from "@cli/logger";

export interface IContentFactory {}

export class ContentFactory implements IContentFactory {
	adminiDb: AdminiDb;
	adminiContentDb: AdminiContentDb;

	constructor() {
		this.adminiDb = new AdminiDb();
		this.adminiContentDb = new AdminiContentDb();
	}

	public getContent(contentId: number): Promise<ICMSContent> {
		return new Promise((resolve, reject) => {
			this.adminiContentDb.getContent(contentId).then((res) => {
				console.log("GET CONTENT ::", res.)
			});
		});
	}
}
