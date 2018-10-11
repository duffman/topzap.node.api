/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */

import { Express }                from "express";
import { Request, Response }      from 'express';
import { MinerDb}                 from "@miner/miner-db";
import { IMinerWorkItem }         from "@miner/miner-session-model";
import { MinerWorkItemUpdate}     from "@miner/miner-session-model";
import { MinerSessionModel }      from "@miner/miner-session-model";
import { IDbResult }              from "@db/db-result";
import { Logger }                 from "../logger";

export class MinerServer {
	minerDb: MinerDb;

	constructor() {
		this.minerDb = new MinerDb();
	}

	/**
	 * Get work items
	 * @param {number} sessionId
	 * @param {number} size
	 * @returns {Promise<Array<IMinerWorkItem>>}
	 */
	public getWorkQueue(sessionId: number, size: number): Promise<Array<IMinerWorkItem>> {
		let scope = this;

		return new Promise((resolve, reject) => {
			return scope.minerDb.getWorkQueue(sessionId, size).then((result) => {
				resolve(result);
			}).catch((err) => {
				reject(err);
			});
		});
	}

	public addVendor(name: string, type: number): Promise<boolean> {
		let scope = this;

		return new Promise((resolve, reject) => {
			return scope.minerDb.addVendor(name, type).then((result) => {
				resolve(result.success);
			}).catch((err) => {
				reject(err);
			});
		});
	}

	public updateWorkItem(item: MinerWorkItemUpdate): Promise<boolean> {
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
	public aquireSession(vendorId: number, minerName: string): Promise<MinerSessionModel> {
		let scope = this;
		let sessionData: MinerSessionModel;

		function haveMinerSession(vendorId: number): Promise<boolean> {
			return new Promise((resolve, reject) => {
				return scope.minerDb.haveMinerSession(vendorId).then((result) => {
					resolve(result);
				}).catch((err) => {
					reject(err);
				});
			});
		}

		function getMinerSession(vendorId: number): Promise<MinerSessionModel> {
			return new Promise((resolve, reject) => {
				return scope.minerDb.getMinerSession(vendorId).then((result) => {
					Logger.logCyan("getMinerSession **** ");
					Logger.logGreen("getMinerSession :: Session ::", result);
					resolve(result);
				}).catch((err) => {
					reject(err);
				});
			});
		}

		function createSession(vendorId: number, minerName: string): Promise<IDbResult> {
			return new Promise((resolve, reject) => {
				return scope.minerDb.createMinerSession(vendorId, minerName).then((result) => {
					resolve(result);
				}).catch((err) => {
					reject(err);
				});
			});
		}

		function createMinerQueue(sessionId: Number): Promise<boolean> {
			return new Promise((resolve, reject) => {
				return scope.minerDb.createMinerQueue(sessionId).then((result) => {
					resolve(result);
				}).catch((err) => {
					reject(err);
				});
			});
		}

		async function getSession(vendorId: number, minerName: string): Promise<void> {
			console.log("getSession ------>");

			let haveSession: boolean = await haveMinerSession(vendorId);

			if (haveSession) {
				console.log("Have session!!");

				sessionData = await getMinerSession(vendorId);

			} else {
				Logger.logYellow(`Miner Session for Vendor Id "${vendorId}" Does NOT exist!`);

				let newSessionRes: IDbResult = await createSession(vendorId, minerName);

				if (!newSessionRes.success) {
					return;
				}

				Logger.logGreen("Create session :: newSessionRes ::", newSessionRes);

				let sessionId = newSessionRes.lastInsertId;

				console.log("Create sessionId :: newSessionRes ::", sessionId);

				let createQueueRes = await createMinerQueue(sessionId);
				sessionData = await getMinerSession(vendorId);
			}
		}

		return new Promise((resolve, reject) => {
			getSession(vendorId, minerName).then((session) => {
				resolve(sessionData);
			}).catch((err) => {
				Logger.logError("aquireSession :: error ::", err);
			});
		});
	}

	private internalError(res: Response, message: string) {
		res.writeHead(501, {'Content-Type': 'text/plain'});
		res.end(message);
	}

	public init(expressApp: Express) {
		let scope = this;

		//
		// Get Miner Session
		//
		expressApp.get('/miner/session/:id/:name?', (req, res) => {
			let id = Number(req.params.id);
			let name = req.params.name != null ? req.params.name: "NAME_UNSET";

			Logger.logCyan("Miner Session ::", id);
			Logger.logCyan("Miner Name ::", name);

			scope.aquireSession(id, name).then((session) => {
				res.json(session);

			}).catch((err: Error) => {
				res.writeHead(501, {'Content-Type': 'text/plain'});
				res.end(err.message);
			});
		});

		//
		// Get Queued Work Items
		//
		expressApp.get("/miner/queue/:id/:size?", (req, res) => {
			let sessionId = Number(req.params.id);
			let size = req.params.size != null ? Number(req.params.size): 10;

			scope.getWorkQueue(sessionId, size).then((queueItems) => {
				res.json(queueItems);

			}).catch((err: Error) => {
				res.writeHead(501, {'Content-Type': 'text/plain'});
				res.end(err.message);
			});
		});

		//
		// Updated Queued Work Item
		//
		expressApp.post("/miner/update", (req, res) => {
			Logger.logGreen("Miner Update", req.body);

			let form = req.body;
			Logger.logCyan("form.itemId", form.itemId);
			Logger.logCyan("form.sessionId", form.sessionId);
			Logger.logCyan("form.accepted", form.accepted);
			Logger.logCyan("form.title", form.title);
			Logger.logCyan("form.price", form.price);
			Logger.logCyan("form.message", form.message);

			let item = new MinerWorkItemUpdate(
				form.id,
				form.sessionId,
				form.accepted,
				form.title,
				form.price,
				form.message
			);

			Logger.logGreen("item ::", item);
			Logger.spit();

			this.minerDb.updateWorkQueue(item).then((result) => {
				Logger.logCyan("updateWorkQueue ::", result);
				res.json(result);

			}).catch((err) => {
				Logger.logError("Error updating work item ::", err);
				this.internalError(res, err.message);
			});
		});
	}
}