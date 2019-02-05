"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const db_kernel_1 = require("@putteDb/db-kernel");
const dynsql_1 = require("@putteDb/dynsql/dynsql");
const cli_logger_1 = require("@cli/cli.logger");
class AdminiContentDb {
    constructor() {
        this.db = new db_kernel_1.DbManager();
        this.init();
    }
    init() {
    }
    getContentByName(contentId) {
        return new Promise((resolve, reject) => {
        });
    }
    getContentById(contentId) {
        let dynSql = new dynsql_1.DynSQL();
        dynSql.select("");
        return new Promise((resolve, reject) => {
            let sql = dynSql.toSQL();
            this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((err) => {
                reject(err);
                cli_logger_1.Logger.logError("AdminiContentDb :: getContent ::", err);
            });
        });
    }
}
exports.AdminiContentDb = AdminiContentDb;
