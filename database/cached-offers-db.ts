/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { DbManager }              from '@putteDb/database-manager';
import { IVendorOfferData }       from '@zapModels/zap-offer.model';
import { VendorOfferData }        from '@zapModels/zap-offer.model';
import { Logger }                 from '@cli/cli.logger';

export class CachedOffersDb {
	db: DbManager;

	constructor() {
		this.db = new DbManager();
	}

	public cacheOffer(data: IVendorOfferData): void {
		let sql = `INSERT INTO cached_offers (
					id,
					code,
					vendor_id,
					title,
					offer,
					cached_time
				) VALUES (
					NULL,
					'${data.code}',
					'${data.vendorId}',
					'${data.title}',
					'${data.offer}',
					CURRENT_TIMESTAMP
				)`;

		console.log("SQL ::", sql);

		this.db.dbQuery(sql).then(res => {
			// This is a fire and forget thing, so we do not do anything...
		}).catch(err => {
			Logger.logError("CachedOffersDb :: cacheOffer :: err ::", err);
		});
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
