"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
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
const settings_1 = require("@app/settings");
const mysql = require("mysql");
const data_sheet_1 = require("./data-sheet");
const sql_table_data_1 = require("./sql-table-data");
const db_result_1 = require("./db-result");
const db_logoger_1 = require("./db-logoger");
const log = console.log;
class DbManager {
    constructor(dbHost = settings_1.Settings.Database.dbHost, dbUser = settings_1.Settings.Database.dbUser, dbPass = settings_1.Settings.Database.dbPass, dbName = settings_1.Settings.Database.dbName) {
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
        if (value === null || value === undefined) {
            value = '';
        }
        value = value.replace('"', '\"');
        value = value.replace("'", '\"');
        return value;
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
                    db_logoger_1.DbLogger.logErrorMessage("dbQuery :: Error ::", error.errno);
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
