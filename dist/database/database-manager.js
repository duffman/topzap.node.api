"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * 2017-2018
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const data_sheet_1 = require("./data-sheet");
const sql_table_data_1 = require("./sql-table-data");
const db_result_1 = require("./db-result");
const util_1 = require("util");
const global_1 = require("../global");
const logger_old_1 = require("../logger.old.");
const log = console.log;
class DbManager {
    constructor(dbHost = global_1.Global.Settings.Database.dbHost, dbUser = global_1.Global.Settings.Database.dbUser, dbPass = global_1.Global.Settings.Database.dbPass, dbName = global_1.Global.Settings.Database.dbName) {
        this.dbHost = dbHost;
        this.dbUser = dbUser;
        this.dbPass = dbPass;
        this.dbName = dbName;
        this.connection = mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPass,
            database: dbName
        });
    }
    static getInstance() {
        let dbManager = new DbManager();
        dbManager.open();
        return dbManager;
    }
    open() {
        this.connection.connect();
    }
    close() {
        this.connection.end();
    }
    query(sql, callback) {
        let dataSheet = new data_sheet_1.DataSheet();
        this.connection.connect();
        this.connection.query(sql, (error, result, fields) => {
            this.connection.end();
            if (error)
                throw error;
            dataSheet.parseFields(fields);
            callback(dataSheet);
        });
    }
    static escape(value) {
        if (util_1.isNullOrUndefined(value))
            value = '';
        value = value.replace('"', '\"');
        value = value.replace("'", '\"');
        return value;
    }
    static mysqlRealEscapeString(str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char; // prepends a backslash to backslash, percent,
                // and double/single quotes
            }
        });
    }
    parseMysqlQueryResult(error, result, tableFields) {
        return new Promise((resolve, reject) => {
            let queryResult = new db_result_1.DbResult();
            if (error) {
                queryResult.success = false;
                queryResult.error = error;
                //error code 1292
                if (error.errno == 1062) {
                    //log("** Duplicate entry")
                }
                else {
                    logger_old_1.Logger.logErrorMessage("dbQuery :: Error ::", error.errno);
                }
                //reject(error);
                resolve(queryResult);
                return;
            }
            else {
                queryResult.affectedRows = result.affectedRows;
                queryResult.lastInsertId = result.insertId;
                let data = new sql_table_data_1.SQLTableData();
                data.parseResultSet(result, tableFields).then((res) => {
                    queryResult.result = res;
                    resolve(queryResult);
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    }
    runInTransaction(sql) {
        let scope = this;
        let result;
        let executeError = null;
        function beginTransaction() {
            return new Promise((resolve, reject) => {
                scope.connection.query("START TRANSACTION", (error, result) => {
                    if (!error) {
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
            });
        }
        function executeSql(sql) {
            return new Promise((resolve, reject) => {
                scope.connection.query(sql, (error, result, tableFields) => {
                    scope.parseMysqlQueryResult(error, result, tableFields).then((res) => {
                        resolve(res);
                    }).catch((err) => {
                        reject(err);
                    });
                });
            });
        }
        function commit() {
            return new Promise((resolve, reject) => {
                scope.connection.query("COMMIT", (error, result) => {
                    console.log("error ::", error);
                    console.log("result ::", result);
                    if (!error) {
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
            });
        }
        function rollback() {
            return new Promise((resolve, reject) => {
                scope.connection.query("ROLLBACK", (error, result) => {
                    console.log("error ::", error);
                    console.log("result ::", result);
                    if (!error) {
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
            });
        }
        function execute() {
            return __awaiter(this, void 0, void 0, function* () {
                let beginTransRes = yield beginTransaction();
                try {
                    result = yield executeSql(sql);
                    yield commit();
                }
                catch (err) {
                    let transError = err != null ? err : new Error("SQL Execution failed");
                    executeError = transError;
                }
                if (executeError != null || !result.success) {
                    yield rollback();
                }
            });
        }
        return new Promise((resolve, reject) => {
            execute().then(() => {
                if (executeError != null) {
                    reject(executeError);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    dbQuery(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, result, tableFields) => {
                this.parseMysqlQueryResult(error, result, tableFields).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }
}
exports.DbManager = DbManager;
