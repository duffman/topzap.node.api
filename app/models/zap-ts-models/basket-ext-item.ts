/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IBasketItem }          from './basket-item.model';

export interface IExtBasketItem extends IBasketItem {
	id: number;
	thumbImage: string;
	platformName: string;
	publisher: string;
	releaseDate: string;
}

/**
 * Extended Basket item for the basket rendering
 * product info is added in the rendering process...
 * 
 * code: "0045496590444"
 * coverImage: "https://clzgames.r.sizr.io/core/covers/lg/a6/a6_70894_0_0_12Switch.jpg"
 * developer: ""
 * genre: "Action, Party"
 * id: 68557
 * platformIcon: "icon-unknown.png"
 * platformImage: "platform-nintendo-switch.png"
 * platformName: "Nintendo Switch"
 * publisher: "Nintendo Switch"
 * releaseDate: "Mar 03, 2017"
 * source: ""
 * thumbImage: "http://clzgames.r.sizr.io/core/covers/sm/a6/a6_70894_0_0_12Switch.jpg"
 * title: "1, 2, Switch"
 * videoSource: null
 * 
 */
export class ExtBasketItem implements IExtBasketItem {
	zid:     string;
	code:     string;
	vendorId: number;
	title:    string;
	offer:    number;
	count:    number;

	constructor(public id: number = -1,
				public thumbImage: string = 'thumb-missing.png',
				public platformName: string = '',
				public publisher: string = '',
				public releaseDate: string = '') {}
}
