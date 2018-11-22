/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { ICMSContent }            from "@cms/cms-content";

export interface ICMSPageData extends ICMSContent {

}

export class PageData implements ICMSPageData {
	id: number;
	name: string;
	shortUrl: string;
	descriotion: string;


}
