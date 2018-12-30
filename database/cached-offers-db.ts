/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { DbManager }              from '@putteDb/database-manager';
import {IVendorOfferData, VendorOfferData} from '@zapModels/zap-offer.model';

export class CachedOffersDb {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
		this.init();
	}

	private init() {}

	public cacheOffer(data: IVendorOfferData): void {
		let sql = `INSERT INTO cached_offers ()
			VALUES (
			
			)
		`;

	}

	public getCachedOffers(code: string): Promise<IVendorOfferData[]> {
		//code='${code}'
		let sql = `
			SELECT
				*
			FROM
				cached_offers
			WHERE
				cached_offers.cached_time > NOW() - INTERVAL 20 MINUTE
		`;

		return new Promise((resolve, reject) => {
			return this.db.dbQuery(sql).then(res => {
				let result: IVendorOfferData[] = null;

				if (res.haveAny()) {
					result = new Array<IVendorOfferData>();
				}

				for (let row of res.result.dataRows) {
					let vendorId = row.getValAsNum("vendor_id");
					let offer = row.getValAsStr("offer");
					//let code = row.getValAsNum("code");
					let title = row.getValAsStr("title");

					result.push(
						new VendorOfferData(
							vendorId,
							offer,
							title
						)
					);
				}

				resolve(result);

			}).catch(err => {
				reject(err);
			});
		});
	}
}