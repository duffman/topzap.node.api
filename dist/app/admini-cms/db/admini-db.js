"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const db_kernel_1 = require("@putteDb/db-kernel");
class AdminiDb {
    constructor() {
        this.db = new db_kernel_1.DbManager();
        this.init();
    }
    init() {
    }
}
exports.AdminiDb = AdminiDb;
