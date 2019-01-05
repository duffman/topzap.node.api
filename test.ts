/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

/*
import {ProductDb} from '@db/product-db';

let prodDb = new ProductDb();

prodDb.getProducts(['0819338020068', '0887195000424']).then(res => {
	console.log("Kalle ::", res);
}).catch(err => {
	console.log("Err ::", err);
});
*/

import { IVendorModel, Vendor } from '@zapModels/vendor-model';

let vendorId: number = 1;


function createBasket(): IVendorBasket {
	let basket = new VendorBasketModel(vendorId);
	basket.items = new Array<IBasketItem>();
	let items = basket.items;

	for (let i = 0; i < 10; i++) {
		let zid = i.toString();
		let code = i + "000434343434";
		let vendorId = i;
		let title = "Item - " + i;
		let offer = PRandNum.getRandomInt(1, 30);
		let count = 1;

		let item = new BasketItem(
			zid,
			code,
			vendorId,
			title,
			offer
		);

		items.push(item)
	}

	vendorId++;
	return basket;
}



import {SessionBasket} from '@zapModels/session-basket';
import {IVendorBasket, VendorBasketModel} from '@zapModels/basket.model';
import {PRandNum} from '@putte/prand-num';
import {BasketItem, IBasketItem} from '@zapModels/basket-item.model';
import {BasketHandler} from '@components/basket/basket.handler';

let bh = new BasketHandler(null);
let sess = new SessionBasket();

sess.data = new Array<IVendorBasket>();
sess.data.push(createBasket());
sess.data.push(createBasket());
sess.data.push(createBasket());
sess.data.push(createBasket());

for (const basket of sess.data) {
	basket.totalValue = bh.getBasketTotal(basket);
}

sess.data = sess.data.sort((x, y) => {
	if (x.totalValue > y.totalValue) {
		return -1;
	}
	if (x.totalValue < y.totalValue) {
		return 1;
	}
	return 0;
});

function sortBy(field) {
	return function(a, b) {
		if (a[field] > b[field]) {
			return -1;
		} else if (a[field] < b[field]) {
			return 1;
		}
		return 0;
	};
}
console.log("CP ::", sess.data);

/*
var sortedArray: string[] = sess.data.sort((n1,totalValue, n2) => {
	if (n1 > n2) {
		return 1;
	}

	if (n1 < n2) {
		return -1;
	}

	return 0;
});
*/


//console.log(sess);
//console.log(sess.data[0]);