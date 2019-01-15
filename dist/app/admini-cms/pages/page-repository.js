"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * Note: This whole thing WILL be replaced with DI when moved to an own project
 */
Object.defineProperty(exports, "__esModule", { value: true });
const page_data_1 = require("@cms/pages/page-data");
const admini_content_db_1 = require("@cms/db/admini-content-db");
const admini_db_1 = require("@cms/db/admini-db");
const content_factory_1 = require("@cms/content-factory");
class PageManager {
    constructor() {
        this.adminiContentDb = new admini_content_db_1.AdminiContentDb();
        this.contectFactory = new content_factory_1.ContentFactory();
        this.adminiDb = new admini_db_1.AdminiDb();
        this.adminiContentDb = new admini_content_db_1.AdminiContentDb();
    }
    getPageById(contentId) {
        let result = new page_data_1.PageData();
        return new Promise((resolve, reject) => {
            this.adminiContentDb.getContentById(contentId).then((res) => {
                console.log("GET CONTENT BY NAME ::", res);
            });
        });
    }
    getPageByName(contentName) {
        return new Promise((resolve, reject) => {
            this.adminiContentDb.getContentByName(contentName).then((res) => {
                console.log("GET CONTENT BY NAME ::", contentName);
            });
        });
    }
}
exports.PageManager = PageManager;
