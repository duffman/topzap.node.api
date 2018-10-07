"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const database_manager_1 = require("@db/database-manager");
const logger_1 = require("../logger");
const miner_session_model_1 = require("@miner/miner-session-model");
const miner_session_model_2 = require("@miner/miner-session-model");
const session_guid_1 = require("@utils/session-guid");
const dynsql_1 = require("@db/dynsql/dynsql");
const base64_1 = require("@utils/base64");
class MinerDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
        this.init();
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
        let sql = `SELECT * FROM price_miner_queue WHERE session_id=${sessionId} AND processed_when IS NULL`; //SELECT * FROM price_miner_queue vendor_id=${sessionId} AND processed_when IS NULL`;
        if (size > -1) {
            sql = sql + ` LIMIT ${size}`;
        }
        console.log("SQL", sql);
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
                    let model = new miner_session_model_1.MinerWorkItemSlim(dbRow.getValAsInt("id"), dbRow.getValAsStr("barcode"));
                    result.push(model);
                }
                resolve(result);
            }).catch((error) => {
                logger_1.Logger.logError("getWorkQueue :: error ::", error);
                reject(error);
            });
        });
    }
    /**
     * Update a work queue entry with price and date from a given id
     * @param {number} id
     * @param {number} price
     * @returns {<boolean>}
     */
    updateWorkQueue(item) {
        let dynQuery = new dynsql_1.DynSQL();
        dynQuery.update("price_miner_queue");
        dynQuery.set("accepted", item.accepted);
        dynQuery.set("price", item.price);
        dynQuery.set("processed_when", item.price, false);
        dynQuery.set("message", item.message);
        dynQuery.where("price_miner_queue.id", item.id);
        let base64 = new base64_1.Base64();
        let message = database_manager_1.DbManager.mysqlRealEscapeString(item.message); // base64.encode(item.message);
        let sql = `UPDATE price_miner_queue SET `
            + `accepted=${item.accepted}, `;
        let strPrice = '' + item.price;
        if (strPrice.length > 0)
            sql = sql + `price='${item.price}', `;
        sql = sql + `processed_when=NOW(), `
            + `message='${message}' `
            + `WHERE id=${item.id}`;
        console.log("sql ::", sql);
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    getMinerSession(vendorId) {
        let sql = `SELECT * FROM price_miner_session WHERE vendor_id=${vendorId} AND completed=0`;
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                let dbRow = dbRes.safeGetFirstRow();
                console.log("dbRow", dbRow);
                if (dbRow.count() > 0) {
                    let model = new miner_session_model_2.MinerSessionModel(dbRow.getValAsInt("id"), dbRow.getValAsStr("session_key"), dbRow.getValAsStr("miner_name"), dbRow.getValAsStr("created"), dbRow.getValAsInt("vendor_id"), dbRow.getValAsInt("completed"));
                    resolve(model);
                }
                else {
                    resolve(new Error("Empty result set"));
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
                logger_1.Logger.logError("Error Gettings Vendors", error);
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
