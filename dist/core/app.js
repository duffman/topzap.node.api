'use strict';Object.defineProperty(exports,'__esModule',{value:true});const express=require('express');const Promise=require('bluebird');const database_manager_1=require('../database/database-manager');const logger_1=require('../logger');const product_db_1=require('./product-db');const miner_server_1=require('../miner/miner-server');class App{constructor(){this.port=8080;this.expressApp=express();this.db=new database_manager_1.DbManager();this.productDb=new product_db_1.ProductDb();this.minerServ=new miner_server_1.MinerServer();this.init();}test(barcode){return new Promise((resolve,reject)=>{this.productDb.getProductOffers(barcode,false).then(result=>{resolve(result);}).catch(error=>{logger_1.Logger.logError('Error in test',error);});});}init(){let app=this.expressApp;var bodyParser=require('body-parser');app.use(bodyParser.urlencoded({extended:true}));app.use(function(req,res,next){res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');next();});app.use(express.static('public'));app.get('/res/:filename',(req,res)=>{let filename=req.params.code;console.log('Get file',filename);});let extendedProdData=true;app.get('/barcode/:code',(req,res)=>{let reqCode=req.params.code;logger_1.Logger.logGreen('Looking up Barcode:',reqCode);this.productDb.getProductOffers(reqCode,extendedProdData).then(result=>{if(result.product!=null)logger_1.Logger.logGreen('Product found:',result.product.title);res.json(result);}).catch(error=>{logger_1.Logger.logError('Error in test',error);});});this.minerServ.init(app);app.listen(this.port);console.log(`Listening on localhost: ${this.port}`);}}exports.App=App;let app=new App();