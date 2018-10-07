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
class MinerWorkItem {
    constructor(id, sessionId, barcode, price, message, processedWhen) {
        this.id = id;
        this.sessionId = sessionId;
        this.barcode = barcode;
        this.price = price;
        this.message = message;
        this.processedWhen = processedWhen;
    }
}
exports.MinerWorkItem = MinerWorkItem;
class MinerWorkItemUpdate {
    constructor(id, sessionId, accepted, price, message) {
        this.id = id;
        this.sessionId = sessionId;
        this.accepted = accepted;
        this.price = price;
        this.message = message;
    }
}
exports.MinerWorkItemUpdate = MinerWorkItemUpdate;
class MinerWorkItemSlim {
    constructor(id, barcode) {
        this.id = id;
        this.barcode = barcode;
    }
}
exports.MinerWorkItemSlim = MinerWorkItemSlim;
