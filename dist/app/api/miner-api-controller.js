"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
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
const controller_utils_1 = require("@api/controller.utils");
const miner_db_1 = require("@miner/miner-db");
const miner_session_model_1 = require("@miner/miner-session-model");
const miner_session_model_2 = require("@miner/miner-session-model");
const miner_session_model_3 = require("@miner/miner-session-model");
const cli_logger_1 = require("@cli/cli.logger");
class MinerApiController {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.minerDb = new miner_db_1.MinerDb();
    }
    attachWSS(wss) {
    }
    initRoutes(routes) {
        let scope = this;
        //
        // Get Miner Session
        //
        routes.get('/miner/session/:id/:name?', (req, res) => {
            let id = Number(req.params.id);
            let name = req.params.name != null ? req.params.name : "NAME_UNSET";
            cli_logger_1.Logger.logCyan("Miner Session ::", id);
            cli_logger_1.Logger.logCyan("Miner Name ::", name);
            scope.aquireSession(id, name).then((session) => {
                res.json(session);
            }).catch((err) => {
                res.writeHead(501, { 'Content-Type': 'text/plain' });
                res.end(err.message);
            });
        });
        //
        // Set Session Completed
        //
        routes.post("/miner/session/done", (req, resp) => {
            cli_logger_1.Logger.logGreen("Miner Update", req.body);
            let form = req.body;
            cli_logger_1.Logger.logCyan("form.sessionId", form.sessionId);
            cli_logger_1.Logger.logCyan("form.vendorId", form.vendorId);
            scope.setSessionDone(form.sessionId, form.vendorId).then((res) => {
                resp.json(res);
            }).catch((err) => {
                controller_utils_1.ApiControllerUtils.internalError(resp);
            });
        });
        //
        // Set Session Completed
        //
        routes.post("/miner/error/log", (req, resp) => {
            cli_logger_1.Logger.logRed("Miner Update", req.body);
            let form = req.body;
            //			Logger.logCyan("form.queueId", form.);
            let item = new miner_session_model_1.MinerErrorLogEntry(form.queueId, form.vendorId, form.sessionId, form.message, form.errorMessage);
            scope.setSessionDone(form.sessionId, form.vendorId).then((res) => {
                resp.json(res);
            }).catch((err) => {
                controller_utils_1.ApiControllerUtils.internalError(resp);
            });
        });
        //
        // Get Queued Work Items
        //
        routes.get("/miner/queue/:id/:size?", (req, resp) => {
            let sessionId = Number(req.params.id);
            let size = req.params.size != null ? Number(req.params.size) : 10;
            scope.getWorkQueue(sessionId, size).then((queueItems) => {
                resp.json(queueItems);
            }).catch((err) => {
                resp.writeHead(501, { 'Content-Type': 'text/plain' });
                resp.end(err.message);
            });
        });
        //
        // Updated Queued Work Item
        //
        routes.post("/miner/update", (req, res) => {
            cli_logger_1.Logger.logGreen("Miner Update", req.body);
            let form = req.body;
            cli_logger_1.Logger.logCyan("form.itemId", form.itemId);
            cli_logger_1.Logger.logCyan("form.sessionId", form.sessionId);
            cli_logger_1.Logger.logCyan("form.accepted", form.accepted);
            cli_logger_1.Logger.logCyan("form.title", form.title);
            cli_logger_1.Logger.logCyan("form.price", form.price);
            cli_logger_1.Logger.logCyan("form.message", form.message);
            let item = new miner_session_model_3.MinerWorkItemUpdate(form.id, form.sessionId, form.accepted, form.title, form.price, form.message);
            cli_logger_1.Logger.logGreen("item ::", item);
            cli_logger_1.Logger.spit();
            this.minerDb.updateWorkQueue(item).then((result) => {
                cli_logger_1.Logger.logCyan("updateWorkQueue ::", result.success);
                let success = result.success && result.affectedRows > 0;
                let updateRes = new miner_session_model_2.WorkItemUpdateRes(form.id, form.sessionId, success);
                res.json(updateRes);
            }).catch((err) => {
                cli_logger_1.Logger.logError("Error updating work item ::", err);
                controller_utils_1.ApiControllerUtils.internalError(res, err.message);
            });
        });
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
    addVendor(name, type) {
        let scope = this;
        return new Promise((resolve, reject) => {
            return scope.minerDb.addVendor(name, type).then((result) => {
                resolve(result.success);
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
     * Marks Miner Session as completed
     * @param {number} sessionId
     * @param {number} vendorId
     * @returns {Promise<boolean>}
     */
    setSessionDone(sessionId, vendorId) {
        let scope = this;
        return new Promise((resolve, reject) => {
            return scope.minerDb.setSessionDone(sessionId, vendorId).then((result) => {
                resolve(result);
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
    aquireSession(vendorId, minerName) {
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
                    cli_logger_1.Logger.logCyan("getMinerSession **** ");
                    cli_logger_1.Logger.logGreen("getMinerSession :: Session ::", result);
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
        function getSession(vendorId, minerName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("getSession ------>");
                let haveSession = yield haveMinerSession(vendorId);
                if (haveSession) {
                    console.log("Have session!!");
                    sessionData = yield getMinerSession(vendorId);
                }
                else {
                    cli_logger_1.Logger.logYellow(`Miner Session for Vendor Id "${vendorId}" Does NOT exist!`);
                    let newSessionRes = yield createSession(vendorId, minerName);
                    if (!newSessionRes.success) {
                        return;
                    }
                    cli_logger_1.Logger.logGreen("Create session :: newSessionRes ::", newSessionRes);
                    let sessionId = newSessionRes.lastInsertId;
                    console.log("Create sessionId :: newSessionRes ::", sessionId);
                    let createQueueRes = yield createMinerQueue(sessionId);
                    sessionData = yield getMinerSession(vendorId);
                }
            });
        }
        return new Promise((resolve, reject) => {
            getSession(vendorId, minerName).then((session) => {
                resolve(sessionData);
            }).catch((err) => {
                cli_logger_1.Logger.logError("aquireSession :: error ::", err);
            });
        });
    }
}
exports.MinerApiController = MinerApiController;
