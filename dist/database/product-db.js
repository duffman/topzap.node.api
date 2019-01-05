'use strict';Object.defineProperty(exports,'__esModule',{value:true});const database_manager_1=require('../lib/putte-db/database-manager');const cli_logger_1=require('../app/cli/cli.logger');const vendor_model_1=require('../app/zap-ts-models/vendor-model');const platform_type_parser_1=require('../lib/utils/platform-type-parser');const pstr_utils_1=require('../lib/putte-ts/pstr-utils');const cli_commander_1=require('../app/cli/cli.commander');const product_model_1=require('../app/zap-ts-models/product.model');const product_model_2=require('../app/zap-ts-models/product.model');class ProductDb{constructor(){this.db=new database_manager_1.DbManager();this.init();}init(){}getGameData(barcode,extended=true,debug=false){function generateSql(){if(!debug){return`SELECT games.* FROM games, product_edition AS edition WHERE edition.barcode='${barcode}' AND games.id = edition.game_id`;}else{return`SELECT games.* FROM games, product_edition AS edition WHERE games.id = edition.game_id ORDER BY RAND() LIMIT 1`;}}let sql=generateSql();cli_logger_1.Logger.logGreen('SQL ::',sql);function createGameProductModel(dbRow){if(dbRow.isEmpty){return new product_model_2.ProductData();}else{return new product_model_1.GameProductData(dbRow.getValAsInt('id'),barcode,dbRow.getValAsStr('platform_name'),dbRow.getValAsStr('title'),dbRow.getValAsStr('publisher'),dbRow.getValAsStr('developer'),dbRow.getValAsStr('genre'),dbRow.getValAsStr('cover_image'),dbRow.getValAsStr('thumb_image'),dbRow.getValAsStr('video_source'),dbRow.getValAsStr('source'),dbRow.getValAsStr('release_date'));}}return new Promise((resolve,reject)=>{return this.db.dbQuery(sql).then(dbRes=>{let dbRow=dbRes.safeGetFirstRow();let model=createGameProductModel(dbRow);let havePlatformAndTitle=!pstr_utils_1.PStrUtils.isEmpty(model.platformName)&&!pstr_utils_1.PStrUtils.isEmpty(model.title);if(extended&&!dbRow.isEmpty&&havePlatformAndTitle){cli_logger_1.Logger.logYellow('Adding extended properties to:',model.title);let gpp=new platform_type_parser_1.PlatformTypeParser();model.platformIcon=gpp.parseFromName(model.title,true);model.platformImage=gpp.parseFromName(model.platformName,false);cli_logger_1.Logger.logCyan('getGameData() :: Model',model);}resolve(model);}).catch(error=>{cli_logger_1.Logger.logError('getGameData() :: error ::',error);reject(error);});});}getProducts(codes){let scope=this;let result=new Array();function getProductPromise(code){return new Promise((resolve,reject)=>{scope.getGameData(code).then(res=>{result.push(res);resolve(res);}).catch(err=>{console.log('getProducts :: Error getting product ::',err);reject(err);});});}return new Promise((resolve,reject)=>{let promises=Array();for(const code of codes){promises.push(getProductPromise(code));}Promise.all(promises).catch(err=>{console.log('getProducts :: err ::',err);reject(err);}).then(()=>{cli_logger_1.Logger.logYellow('Promises Done');resolve(result);});});}getVendors(){let result=new Array();let sql=`SELECT * FROM product_vendors`;return new Promise((resolve,reject)=>{return this.db.dbQuery(sql).then(dbRes=>{for(let i=0;i<dbRes.result.rowCount();i++){let dbRow=dbRes.result.dataRows[i];let model=new vendor_model_1.Vendor(dbRow.getValAsNum('id'),dbRow.getValAsStr('identifier'),dbRow.getValAsStr('vendor_type'),dbRow.getValAsStr('name'),dbRow.getValAsStr('description'),dbRow.getValAsStr('website_url'),dbRow.getValAsStr('logo_name'),'');result.push(model);}resolve(result);}).catch(error=>{cli_logger_1.Logger.logError('Error Gettings Vendors',error);reject(error);});});}}exports.ProductDb=ProductDb;if(cli_commander_1.CliCommander.debug()){console.log('DEBUG!');let debug=new ProductDb();debug.getGameData('0819338020068').then(res=>{console.log('ProductDb ::',res);}).catch(err=>{console.log('ProductDb :: err',err);});}else{console.log('NO DEBUG!');}