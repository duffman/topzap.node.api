"use strict";
/**
 * COLDMIND LTD ("COMPANY") CONFIDENTIAL
 * Unpublished Copyright (c) 2015-2017 COLDMIND LTD, All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains the property of COMPANY. The intellectual and technical concepts contained
 * herein are proprietary to COMPANY and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from COMPANY.  Access to the source code contained herein is hereby forbidden to anyone except current COMPANY employees, managers or contractors who have executed
 * Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 * The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 * information that is confidential and/or proprietary, and is a trade secret, of  COMPANY.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 * OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 * LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 * Created by Patrik Forsberg on 2017
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
//import { IConnection }            from "mysql";
const data_sheet_1 = require("./data-sheet");
const sql_table_data_1 = require("./sql-table-data");
const db_result_1 = require("./db-result");
const util_1 = require("util");
const global_1 = require("../global");
const logger_1 = require("../logger");
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
    dbQuery(sql) {
        let dataTable = new sql_table_data_1.SQLTableData();
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, result, tableFields) => {
                let queryResult = new db_result_1.DbResult();
                if (error) {
                    queryResult.success = false;
                    queryResult.error = error;
                    if (error.errno == 1062) {
                        //log("** Duplicate entry")
                    }
                    else {
                        logger_1.Logger.logErrorMessage("dbQuery :: Error ::", error.errno);
                    }
                    //reject(error);
                    resolve(queryResult);
                    return;
                }
                else {
                    queryResult.affectedRows = result.affectedRows;
                    queryResult.lastInsertId = result.insertId;
                    sql = mysql.escape(sql);
                    let data = new sql_table_data_1.SQLTableData();
                    data.parseResultSet(result, tableFields).then((res) => {
                        queryResult.result = res;
                        resolve(queryResult);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
            //resolve(null);
        }); // new Promise
    }
}
exports.DbManager = DbManager;
