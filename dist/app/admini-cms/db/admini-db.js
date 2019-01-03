"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@putteDb/database-manager");
class AdminiDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
        this.init();
    }
    init() {
    }
}
exports.AdminiDb = AdminiDb;
