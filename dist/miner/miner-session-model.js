"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
class MinerSessionModel {
    constructor(id, sessionKey, minerName, created, vendorId, completed) {
        this.id = id;
        this.sessionKey = sessionKey;
        this.minerName = minerName;
        this.created = created;
        this.vendorId = vendorId;
        this.completed = completed;
    }
}
exports.MinerSessionModel = MinerSessionModel;
class MinerWorkItemExt {
    constructor(id, sessionId, barcode, price, message, processedWhen) {
        this.id = id;
        this.sessionId = sessionId;
        this.barcode = barcode;
        this.price = price;
        this.message = message;
        this.processedWhen = processedWhen;
    }
}
exports.MinerWorkItemExt = MinerWorkItemExt;
class MinerWorkItemUpdate {
    constructor(id, sessionId, accepted, title, price, message) {
        this.id = id;
        this.sessionId = sessionId;
        this.accepted = accepted;
        this.title = title;
        this.price = price;
        this.message = message;
    }
}
exports.MinerWorkItemUpdate = MinerWorkItemUpdate;
class MinerErrorLogEntry {
    constructor(queueId, vendorId, sessionId, message, errorMessage) {
        this.queueId = queueId;
        this.vendorId = vendorId;
        this.sessionId = sessionId;
        this.message = message;
        this.errorMessage = errorMessage;
    }
}
exports.MinerErrorLogEntry = MinerErrorLogEntry;
class WorkItemUpdateRes {
    constructor(itemId, sessionId, success) {
        this.itemId = itemId;
        this.sessionId = sessionId;
        this.success = success;
    }
}
exports.WorkItemUpdateRes = WorkItemUpdateRes;
class MinerWorkItem {
    constructor(id, barcode) {
        this.id = id;
        this.barcode = barcode;
    }
}
exports.MinerWorkItem = MinerWorkItem;
