"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Settings;
(function (Settings) {
    let PriceServiceApi;
    (function (PriceServiceApi) {
        PriceServiceApi.Uri = "http://localhost:6562";
    })(PriceServiceApi = Settings.PriceServiceApi || (Settings.PriceServiceApi = {}));
    let MongoDb;
    (function (MongoDb) {
        MongoDb.mongoDbUrl = "mongodb://localhost:27017/TopZapDB";
    })(MongoDb = Settings.MongoDb || (Settings.MongoDb = {}));
    let Database;
    (function (Database) {
        Database.dbName = "topzap-prod";
        Database.dbHost = "localhost";
        Database.dbUser = "duffman";
        Database.dbPass = "bjoe7151212";
    })(Database = Settings.Database || (Settings.Database = {}));
})(Settings = exports.Settings || (exports.Settings = {}));
