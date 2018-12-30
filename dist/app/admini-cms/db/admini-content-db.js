"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@putteDb/database-manager");
const dynsql_1 = require("@putteDb/dynsql/dynsql");
const cli_logger_1 = require("@cli/cli.logger");
class AdminiContentDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
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
