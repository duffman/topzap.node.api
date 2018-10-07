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
const miner_db_1 = require("@miner/miner-db");
const miner_session_model_1 = require("@miner/miner-session-model");
const logger_1 = require("../logger");
class MinerServer {
    constructor() {
        this.minerDb = new miner_db_1.MinerDb();
    }
    /**
     * Get work items
     * @param {number} sessionId
     * @param {number} size
     * @returns {Promise<Array<IMinerWorkItem>>}
     */
    getWorkQueue(sessionId, size) {
        let scope = this;
        return new Promise((resolve, reject) => {
            return scope.minerDb.getWorkQueue(sessionId, size).then((result) => {
                resolve(result);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    updateWorkItem(item) {
        let scope = this;
        return new Promise((resolve, reject) => {
            return scope.minerDb.updateWorkQueue(item).then((result) => {
                resolve(result.success);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * Return session (if not exists, create it)
     * @param {number} vendorId
     * @returns {Promise<MinerSessionModel>}
     */
    aquireSession(vendorId) {
        let scope = this;
        let sessionData;
        function haveMinerSession(vendorId) {
            return new Promise((resolve, reject) => {
                return scope.minerDb.haveMinerSession(vendorId).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        function getMinerSession(vendorId) {
            return new Promise((resolve, reject) => {
                return scope.minerDb.getMinerSession(vendorId).then((result) => {
                    logger_1.Logger.logCyan("getMinerSession **** ");
                    logger_1.Logger.logGreen("getMinerSession :: Session ::", result);
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        function createSession(vendorId, minerName) {
            return new Promise((resolve, reject) => {
                return scope.minerDb.createMinerSession(vendorId, minerName).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        function createMinerQueue(sessionId) {
            return new Promise((resolve, reject) => {
                return scope.minerDb.createMinerQueue(sessionId).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        function getSession(vendorId) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("getSession ------>");
                let haveSession = yield haveMinerSession(vendorId);
                if (haveSession) {
                    console.log("Have session!!");
                    sessionData = yield getMinerSession(vendorId);
                }
                else {
                    console.log("DONT Have session!!");
                    let newSessionRes = yield createSession(vendorId, "test-miner");
                    if (!newSessionRes.success) {
                        return;
                    }
                    console.log("Create session SUCCESS!!");
                    console.log("Create session :: newSessionRes ::", newSessionRes);
                    let sessionId = newSessionRes.lastInsertId;
                    console.log("Create sessionId :: newSessionRes ::", sessionId);
                    let createQueueRes = yield createMinerQueue(sessionId);
                    sessionData = yield getMinerSession(vendorId);
                }
            });
        }
        return new Promise((resolve, reject) => {
            getSession(vendorId).then((session) => {
                resolve(sessionData);
            }).catch((err) => {
                logger_1.Logger.logError("aquireSession :: error ::", err);
            });
        });
    }
    internalError(res, message) {
        res.writeHead(501, { 'Content-Type': 'text/plain' });
        res.end(message);
    }
    init(expressApp) {
        let scope = this;
        //
        // Get Miner Session
        //
        expressApp.get('/miner/session/:id', (req, res) => {
            let id = Number(req.params.id);
            console.log("Miner Session:", id);
            scope.aquireSession(id).then((session) => {
                res.json(session);
            }).catch((err) => {
                res.writeHead(501, { 'Content-Type': 'text/plain' });
                res.end(err.message);
            });
        });
        //
        // Get Queued Work Items
        //
        expressApp.get("/miner/queue/:id/:size", (req, res) => {
            let sessionId = Number(req.params.id);
            let size = req.params.size != null ? Number(req.params.size) : 10;
            scope.getWorkQueue(sessionId, 100).then((queueItems) => {
                res.json(queueItems);
            }).catch((err) => {
                res.writeHead(501, { 'Content-Type': 'text/plain' });
                res.end(err.message);
            });
        });
        //
        // Updated Queued Work Item
        //
        expressApp.post("/miner/update", (req, res) => {
            logger_1.Logger.logGreen("Miner Update", req.body);
            let form = req.body;
            logger_1.Logger.logCyan("form.itemId", form.itemId);
            logger_1.Logger.logCyan("form.accepted", form.accepted);
            logger_1.Logger.logCyan("form.price", form.price);
            logger_1.Logger.logCyan("form.message", form.message);
            let item = new miner_session_model_1.MinerWorkItemUpdate(form.id, form.sessionId, form.accepted, form.price, form.message);
            logger_1.Logger.logGreen("item ::", item);
            console.log('');
            console.log('');
            this.minerDb.updateWorkQueue(item).then((result) => {
                logger_1.Logger.logCyan("updateWorkQueue ::", result);
            }).catch((err) => {
                logger_1.Logger.logError("Error updating work item ::", err);
                this.internalError(res, err.message);
            });
        });
    }
}
exports.MinerServer = MinerServer;
