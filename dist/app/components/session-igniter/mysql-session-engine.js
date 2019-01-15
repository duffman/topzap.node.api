"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sql_string_1 = require("@putteDb/dynsql/sql-string");
const database_manager_1 = require("@putteDb/database-manager");
const cli_logger_1 = require("@cli/cli.logger");
const cli_debug_yield_1 = require("@cli/cli.debug-yield");
const session_igniter_entry_1 = require("@components/session-igniter/session-igniter-entry");
class MysqlSessionEngine {
    constructor() {
        this.tableName = "session_storage";
        this.dataColumn = "data";
        this.db = new database_manager_1.DbManager();
    }
    createEntry(sessId) {
        return this.setData(sessId, new session_igniter_entry_1.SessionEntry(sessId));
    }
    getData(sessId, autoCreate = true) {
        const sql = `SELECT name, ${this.dataColumn} FROM ${this.tableName} WHERE name='${sessId}'`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then(res => {
                if (!res.haveAny() && autoCreate) {
                    return this.createEntry(sessId);
                }
                else if (!res.haveAny() && !autoCreate) {
                    resolve(null);
                }
                else {
                    let row = res.safeGetFirstRow();
                    let dataStr = row.getValAsStr(this.dataColumn);
                    let jsonObj = JSON.parse(dataStr);
                    let entry = new session_igniter_entry_1.SessionEntry(sessId, jsonObj.data);
                    resolve(entry);
                }
            }).then(res => {
                resolve(res);
            }).catch(err => {
                const errMess = "MysqlSessionEngine :: getData :: ERROR ::";
                cli_logger_1.Logger.logFatalError(errMess, err);
                cli_debug_yield_1.CliDebugYield.fatalError(errMess, err);
                reject(err);
            });
        });
    }
    getDataStr(sessId) {
        /*
        return new Promise((resolve, reject) => {
            return this.getData(sessId).then(data => {





                resolve(data);
            }).catch(err => {
                const errMess = "MysqlSessionEngine :: getDataStr :: ERROR ::";
                Logger.logFatalError(errMess, err);
                CliDebugYield.fatalError(errMess, err);
                reject(err);
            });
        });
        */
        throw new Error("Not implemented");
    }
    setEntry(sessId, data) {
        return this.setData(sessId, data.data);
    }
    setData(sessId, data) {
        function isSessionEntry(obj) {
            let result = false;
            let objType = typeof obj;
            if (objType === "object") {
                result = (obj.hasOwnProperty("id")) && obj.hasOwnProperty("data");
            }
            return result;
        }
        let entry;
        if (!isSessionEntry(data)) {
            entry = new session_igniter_entry_1.SessionEntry(sessId, data);
        }
        else {
            entry = data;
        }
        //		let entry = new SessionEntry(sessId, data);
        const dataStr = sql_string_1.default.escape(entry);
        const sql = `REPLACE INTO session_storage (id, name, data, data_type) VALUES (NULL, '${sessId}', '${dataStr}', NULL)`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then(res => {
                if (res.success) {
                    resolve(entry);
                }
                else {
                    resolve(null);
                }
            }).catch(err => {
                const errMess = "MysqlSessionEngine :: setData :: ERROR ::";
                cli_logger_1.Logger.logFatalError(errMess, err);
                cli_debug_yield_1.CliDebugYield.fatalError(errMess, err);
                reject(err);
            });
        });
    }
}
exports.MysqlSessionEngine = MysqlSessionEngine;
