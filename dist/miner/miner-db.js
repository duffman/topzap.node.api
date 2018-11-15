"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
/*

UPDATE `price_miner_queue` SET processed_when = NULL WHERE `session_id` = 30 AND processed_when >= DATE_SUB(NOW(), INTERVAL 1 HOUR)

 */
const database_manager_1 = require("@db/database-manager");
const logger_1 = require("@cli/logger");
const miner_session_model_1 = require("@miner/miner-session-model");
const miner_session_model_2 = require("@miner/miner-session-model");
const session_guid_1 = require("@utils/session-guid");
const dynsql_1 = require("@db/dynsql/dynsql");
const base64_1 = require("@utils/base64");
const sql_string_1 = require("@db/dynsql/sql-string");
class MinerDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
        this.init();
        let dynQuery = new dynsql_1.DynSQL();
        let data = {
            name: String("mitt namn"),
            type: 12
        };
        let sql = dynQuery.insert(data, "product_vendors").toSQL();
        console.log("SQL ::", sql);
    }
    init() { }
    haveMinerSession(vendorId) {
        let sql = `SELECT count(*) AS count FROM price_miner_session WHERE vendor_id=${vendorId}`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let dbRow = dbRes.safeGetFirstRow();
                let haveSession = dbRow.getValAsInt("count") > 0;
                resolve(haveSession);
            }).catch((error) => {
                logger_1.Logger.logError("getMinerSession :: error ::", error);
                reject(error);
            });
        });
    }
    //
    // Get Product
    // - extended adds pltform image info
    //
    getWorkQueue(sessionId, size = -1) {
        //
        // If the barcode is shorter than 13, add a ZERO
        // The reason to why we need this is unknown...
        function prepBarcode(barcode) {
            /*if (barcode.length == 12) {
                return "0" + barcode;
            }*/
            return barcode;
        }
        let sql = `SELECT * FROM price_miner_queue WHERE session_id=${sessionId} AND processed_when IS NULL ORDER BY RAND()`; //SELECT * FROM price_miner_queue vendor_id=${sessionId} AND processed_when IS NULL`;
        if (size > -1) {
            sql = sql + ` LIMIT ${size}`;
        }
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let result = new Array();
                for (let i = 0; i < dbRes.result.rowCount(); i++) {
                    let dbRow = dbRes.result.dataRows[i];
                    /*
                    let model = new MinerWorkItem(
                        dbRow.getValAsInt("id"),
                        dbRow.getValAsInt("session_id"),
                        dbRow.getValAsStr("barcode"),
                        dbRow.getValAsStr("price"),
                        dbRow.getValAsStr("processed_when")
                    );
                    */
                    let model = new miner_session_model_1.MinerWorkItem(dbRow.getValAsInt("id"), prepBarcode(dbRow.getValAsStr("barcode")));
                    result.push(model);
                }
                resolve(result);
            }).catch((error) => {
                logger_1.Logger.logError("getWorkQueue :: error ::", error);
                reject(error);
            });
        });
    }
    checkOutWorkQueue(sessionId, size = 10) {
        let scope = this;
        return new Promise((resolve, reject) => {
            scope.getWorkQueue(sessionId, size).then((workItems) => {
                let idList = new Array();
                for (let i = 0; i < workItems.length; i++) {
                    let item = workItems[i];
                    let entry = `id=${item.id}`;
                    idList.push(entry);
                }
                let sql = "UPDATE price_miner_queue SET checkout_time=NOW() WHERE " + idList.join(" OR ");
                console.log(sql);
                scope.db.dbQuery(sql).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }
    addVendor(name, type = -1) {
        let dynQuery = new dynsql_1.DynSQL();
        let data = {
            name: name,
            type: type
        };
        let sql = dynQuery.insert(data, "product_vendors").toSQL();
        console.log("ADD VENDOR SQL >> ", sql);
        return new Promise((resolve, reject) => {
            /*return this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((error) => {
                reject(error)
            })*/
        });
    }
    /**
     * Update a work queue entry with price and date from a given id
     * @param {number} id
     * @param {number} price
     * @returns {<boolean>}
     */
    updateWorkQueue(item) {
        let scope = this;
        let dynQuery = new dynsql_1.DynSQL();
        dynQuery.update("price_miner_queue");
        dynQuery.set("accepted", item.accepted);
        dynQuery.set("price", item.price);
        dynQuery.set("title", item.title);
        dynQuery.set("processed_when", item.price, false);
        dynQuery.set("message", item.message);
        dynQuery.where("price_miner_queue.id", item.id);
        let base64 = new base64_1.Base64();
        let message = sql_string_1.default.escapeString(item.message);
        let sql = `UPDATE price_miner_queue SET `
            + `accepted=${item.accepted}, `;
        sql = sql + `title='${item.title}', `;
        let strPrice = '' + item.price;
        if (strPrice.length > 0)
            sql = sql + `price='${item.price}', `;
        sql = sql + `processed_when=NOW(), `
            + `message=${message} `
            + `WHERE id=${item.id} AND session_id=${item.sessionId}`;
        logger_1.Logger.logGreen("updateWorkQueue :: sql ::", sql);
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    getMinerSession(vendorId) {
        let sql = `SELECT * FROM price_miner_session WHERE vendor_id=${vendorId} AND completed IS NULL`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let dbRow = dbRes.safeGetFirstRow();
                console.log("dbRow", dbRow);
                if (dbRow.count() > 0) {
                    let model = new miner_session_model_2.MinerSessionModel(dbRow.getValAsInt("id"), dbRow.getValAsStr("session_key"), dbRow.getValAsStr("miner_name"), dbRow.getValAsStr("created"), dbRow.getValAsInt("vendor_id"), dbRow.getValAsInt("completed"));
                    resolve(model);
                }
                else {
                    reject(new Error("Empty result set"));
                }
            }).catch((error) => {
                logger_1.Logger.logError("getMinerSession :: error ::", error);
                reject(error);
            });
        });
    }
    //
    // Create Miner Session
    //
    createMinerSession(vendorId, minerName = "<noname>") {
        let sql = `INSERT INTO price_miner_session (session_key, vendor_id, miner_name, created) `
            + `VALUES ("${session_guid_1.Guid.newGuid()}", ${vendorId}, "${minerName}", NOW())`;
        console.log("SQL", sql);
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((error) => {
                logger_1.Logger.logError("createMinerSession", error);
                reject(error);
            });
        });
    }
    //
    // Mark Session As Co
    //
    setSessionDone(sessionId, vendorId) {
        let sql = `UPDATE price_miner_session SET completed=NOW() WHERE id=${sessionId} AND vendor_id=${vendorId} AND completed IS NULL`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let success = dbRes.affectedRows > 0;
                resolve(success);
            }).catch((error) => {
                logger_1.Logger.logError("setSessionDone", error);
                reject(error);
            });
        });
    }
    //
    // Create Miner Work Queue
    //
    createMinerQueue(sessionId) {
        let sql = `INSERT INTO price_miner_queue (session_id, barcode) SELECT ${sessionId}, barcode FROM product_edition`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let success = dbRes.affectedRows > 0;
                resolve(success);
            }).catch((error) => {
                logger_1.Logger.logError("Error Gettings Vendors", error);
                reject(error);
            });
        });
    }
}
exports.MinerDb = MinerDb;
