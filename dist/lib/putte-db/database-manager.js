"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const mysql = require("mysql");
const data_sheet_1 = require("./data-sheet");
const sql_table_data_1 = require("./sql-table-data");
const db_result_1 = require("./db-result");
const db_logoger_1 = require("./db-logoger");
const log = console.log;
class DbManager {
    constructor(dbHost = zappy_app_settings_1.Settings.Database.dbHost, dbUser = zappy_app_settings_1.Settings.Database.dbUser, dbPass = zappy_app_settings_1.Settings.Database.dbPass, dbName = zappy_app_settings_1.Settings.Database.dbName) {
        this.dbHost = dbHost;
        this.dbUser = dbUser;
        this.dbPass = dbPass;
        this.dbName = dbName;
        this.connection = DbManager.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPass,
            database: dbName
        });
    }
    static createConnection(settings, openConnection = true) {
        let connection = mysql.createConnection({
            host: settings.host,
            user: settings.user,
            password: settings.password,
            database: settings.database
        });
        if (openConnection) {
            connection.connect();
        }
        return connection;
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
                let customError = error;
                //error code 1292
                if (error.errno === 'ECONNREFUSED') {
                    customError = new Error("ECONNREFUSED");
                }
                if (error.errno == 1062) {
                    customError = new Error("DUP_ENTRY");
                }
                else {
                    db_logoger_1.DbLogger.logErrorMessage("dbQuery :: Error ::", error.errno);
                }
                reject(customError);
                //resolve(queryResult);
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
        async function execute() {
            let beginTransRes = await beginTransaction();
            try {
                result = await executeSql(sql);
                await commit();
            }
            catch (err) {
                let transError = err != null ? err : new Error("SQL Execution failed");
                executeError = transError;
            }
            if (executeError != null || !result.success) {
                await rollback();
            }
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
    returnResult() {
        return new Promise((resolve, reject) => {
        });
    }
    countRows(table, where, is) {
        let countAlias = "count";
        return new Promise((resolve, reject) => {
            let query = `SELECT COUNT(*) AS ${countAlias} FROM ${table} WHERE ${where}${is}`;
            this.dbQuery(query).then(res => {
                let row = res.safeGetFirstRow();
                let count = row.getValAsNum(countAlias);
                resolve(count);
            }).catch(err => {
                resolve(-1);
            });
        });
    }
    dbQuery(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, result, tableFields) => {
                if (error) {
                    if (error.fatal) {
                        console.trace('fatal error: ' + error.message);
                    }
                    reject(error);
                }
                else {
                    return this.parseMysqlQueryResult(error, result, tableFields).then((res) => {
                        if (error) {
                            console.log("FET ERROR ::", error);
                        }
                        else {
                            resolve(res);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
        });
    }
}
exports.DbManager = DbManager;
