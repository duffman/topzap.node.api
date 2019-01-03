'use strict';Object.defineProperty(exports,'__esModule',{value:true});const database_manager_1=require('../lib/putte-db/database-manager');const zap_offer_model_1=require('../app/zap-ts-models/zap-offer.model');const cli_logger_1=require('../app/cli/cli.logger');class CachedOffersDb{constructor(){this.db=new database_manager_1.DbManager();}cacheOffer(data){let sql=`INSERT INTO cached_offers (
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
				)`;console.log('SQL ::',sql);this.db.dbQuery(sql).then(res=>{}).catch(err=>{cli_logger_1.Logger.logError('CachedOffersDb :: cacheOffer :: err ::',err);});}getCachedOffers(code){let sql=`
			SELECT
				*
			FROM
				cached_offers
			WHERE
				cached_offers.cached_time > NOW() - INTERVAL 20 MINUTE
		`;return new Promise((resolve,reject)=>{return this.db.dbQuery(sql).then(res=>{let result=null;if(res.haveAny()){result=new Array();}for(let row of res.result.dataRows){let vendorId=row.getValAsNum('vendor_id');let offer=row.getValAsStr('offer');let title=row.getValAsStr('title');result.push(new zap_offer_model_1.VendorOfferData(vendorId,offer,title));}resolve(result);}).catch(err=>{reject(err);});});}}exports.CachedOffersDb=CachedOffersDb;