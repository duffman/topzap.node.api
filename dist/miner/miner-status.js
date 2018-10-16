"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
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
const database_manager_1 = require("@db/database-manager");
const dynsql_1 = require("@db/dynsql/dynsql");
const logger_1 = require("../logger");
class ProgressRec {
    constructor(totalCount, successCount, processedCount) {
        this.totalCount = totalCount;
        this.successCount = successCount;
        this.processedCount = processedCount;
    }
}
exports.ProgressRec = ProgressRec;
class MinerStatucRec {
    constructor(sessionId, minerName, vendorId, sessionKey, completed, totalCount, successCount, processedCount, percentDone) {
        this.sessionId = sessionId;
        this.minerName = minerName;
        this.vendorId = vendorId;
        this.sessionKey = sessionKey;
        this.completed = completed;
        this.totalCount = totalCount;
        this.successCount = successCount;
        this.processedCount = processedCount;
        this.percentDone = percentDone;
    }
}
exports.MinerStatucRec = MinerStatucRec;
class MinerStatus {
    constructor() {
        this.db = new database_manager_1.DbManager();
    }
    getSessionInfo() {
        let dynSql = new dynsql_1.DynSQL();
        let sql = dynSql.select("ms.id", "ms.session_key", "ms.completed", "pv.id AS pv_id", "pv.name")
            .from("price_miner_session", "ms")
            .from("product_vendors", "pv")
            .where("pv.id", "ms.vendor_id", false).toSQL();
        console.log(sql);
        return new Promise((resolve, reject) => {
            return this.db.dbQuery(sql).then((dbRes) => {
                resolve(dbRes);
            }).catch((error) => {
                logger_1.Logger.logError("getMinerSession :: error ::", error);
                reject(error);
            });
        });
    }
    getProgressInfo() {
        let scope = this;
        /*
        function execSql(sql: string): Promise<IDbResult> {
            return new Promise((resolve, reject) => {
                return this.db.dbQuery(sql).then((dbRes) => {
                    resolve(dbRes);
                }).catch((error) => {
                    Logger.logError("getMinerSession :: error ::", error);
                    reject(error);
                });
            });
        }*/
        function getSessionDbRes() {
            return new Promise((resolve, reject) => {
                return scope.getSessionInfo().then((dbRes) => {
                    resolve(dbRes);
                }).catch((error) => {
                    logger_1.Logger.logError("getMinerSession :: error ::", error);
                    reject(error);
                });
            });
        }
        function getSessionProg(sessionId) {
            let sql = `SELECT (SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId}) AS totalCount,
			(SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId} AND processed_when IS NOT NULL AND price > -1) AS successCount,
			(SELECT COUNT(*) FROM price_miner_queue WHERE session_id = ${sessionId} AND processed_when IS NOT NULL) AS processedCount`;
            return new Promise((resolve, reject) => {
                return scope.db.dbQuery(sql).then((dbRes) => {
                    let row = dbRes.safeGetFirstRow();
                    let result = new ProgressRec(row.getValAsNum("totalCount"), row.getValAsNum("successCount"), row.getValAsNum("processedCount"));
                    resolve(result);
                }).catch((error) => {
                    logger_1.Logger.logError("getMinerSession :: error ::", error);
                    reject(error);
                });
            });
        }
        function getInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                let sessionInfo = yield getSessionDbRes();
                for (let i = 0; i < sessionInfo.result.rowCount(); i++) {
                    let row = sessionInfo.result.dataRows[i];
                    /*
                    public sessionId: number,
                    public minerName: string,
                    public vendorId: number,
                    public sessionKey: string,
                    public totalCount: number,
                    public successCount: number,
                    public processedCount: number,
                    public percentDone: number
    
                     */
                    let sessId = row.getValAsNum("id");
                    let name = row.getValAsStr("name");
                    let vendorId = row.getValAsNum("pv_id");
                    let sessKey = row.getValAsStr("session_key");
                    let completed = row.getValAsStr("completed");
                    let progRec = yield getSessionProg(sessId);
                    let percentDone = (progRec.processedCount / progRec.totalCount) * 100;
                    let statusRec = new MinerStatucRec(sessId, name, vendorId, sessKey, completed, progRec.totalCount, progRec.successCount, progRec.processedCount, percentDone);
                    console.log("statusRec", statusRec);
                }
                scope.db.close();
            });
        }
        return new Promise((resolve, reject) => {
            getInfo().then(() => {
                resolve(null);
            });
        });
    }
}
exports.MinerStatus = MinerStatus;
