"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var AdminiSettings;
(function (AdminiSettings) {
    let Database;
    (function (Database) {
        Database.dbName = "admini";
        Database.dbHost = "localhost";
        Database.dbUser = "duffman";
        Database.dbPass = "bjoe7151212";
    })(Database = AdminiSettings.Database || (AdminiSettings.Database = {}));
})(AdminiSettings = exports.AdminiSettings || (exports.AdminiSettings = {}));
