"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 *
 * @author Patrik Forsberg
 * @date 2018-11-20
 *
 */
const admini_db_1 = require("@cms/db/admini-db");
const admini_content_db_1 = require("@cms/db/admini-content-db");
class ContentFactory {
    constructor() {
        this.adminiDb = new admini_db_1.AdminiDb();
        this.adminiContentDb = new admini_content_db_1.AdminiContentDb();
    }
    getContent(contentId) {
        return new Promise((resolve, reject) => {
            this.adminiContentDb.getContentById(contentId).then((res) => {
                console.log("GET CONTENT :: JSON DEBUG::", res.rawObj);
                resolve(null);
            });
        });
    }
}
exports.ContentFactory = ContentFactory;
