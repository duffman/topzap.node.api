"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@putteDb/database-manager");
const zap_offer_model_1 = require("@zapModels/zap-offer.model");
const cli_logger_1 = require("@cli/cli.logger");
class CachedOffersDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
    }
    cacheOffer(data) {
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
            cli_logger_1.Logger.logError("CachedOffersDb :: cacheOffer :: err ::", err);
        });
    }
    getCachedOffers(code) {
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
                let result = null;
                if (res.haveAny()) {
                    result = new Array();
                }
                for (let row of res.result.dataRows) {
                    let vendorId = row.getValAsNum("vendor_id");
                    let offer = row.getValAsStr("offer");
                    let code = row.getValAsStr("code");
                    let title = row.getValAsStr("title");
                    let data = new zap_offer_model_1.VendorOfferData(vendorId, title, offer);
                    data.accepted = true;
                    data.code = code;
                    result.push(data);
                }
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}
exports.CachedOffersDb = CachedOffersDb;
