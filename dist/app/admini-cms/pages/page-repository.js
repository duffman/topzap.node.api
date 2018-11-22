'use strict';Object.defineProperty(exports,'__esModule',{value:true});const page_data_1=require('./page-data');const admini_content_db_1=require('../db/admini-content-db');const admini_db_1=require('../db/admini-db');const content_factory_1=require('../content-factory');class PageManager{constructor(){this.adminiContentDb=new admini_content_db_1.AdminiContentDb();this.contectFactory=new content_factory_1.ContentFactory();this.adminiDb=new admini_db_1.AdminiDb();this.adminiContentDb=new admini_content_db_1.AdminiContentDb();}getPageById(contentId){let result=new page_data_1.PageData();return new Promise((resolve,reject)=>{this.adminiContentDb.getContentById(contentId).then(res=>{console.log('GET CONTENT BY NAME ::',res);});});}getPageByName(contentName){return new Promise((resolve,reject)=>{this.adminiContentDb.getContentByName(contentName).then(res=>{console.log('GET CONTENT BY NAME ::',contentName);});});}}exports.PageManager=PageManager;