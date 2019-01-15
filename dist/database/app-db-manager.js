"use strict";
/**
 * Patrik Forsberg ("CREATOR") CONFIDENTIAL
 * Unpublished Copyright (c) 2015-2018 Patrik Forsberg, All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains the property of CREATOR. The intellectual and technical concepts contained
 * herein are proprietary to COMPANY and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from COMPANY.  Access to the source code contained herein is hereby forbidden to anyone except current CREATOR employees, managers or contractors who have executed
 * Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 * The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 * information that is confidential and/or proprietary, and is a trade secret, of  CREATOR.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 * OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF CREATOR IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 * LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const database_manager_1 = require("@putteDb/database-manager");
const cli_debug_yield_1 = require("@cli/cli.debug-yield");
exports.ConnectionSettings = {
    host: zappy_app_settings_1.Settings.Database.dbHost,
    user: zappy_app_settings_1.Settings.Database.dbUser,
    password: zappy_app_settings_1.Settings.Database.dbPass,
    database: zappy_app_settings_1.Settings.Database.dbName
};
class AppDbManager {
    static createConnection() {
        let connection;
        try {
            connection = database_manager_1.DbManager.createConnection(exports.ConnectionSettings);
        }
        catch (err) {
            cli_debug_yield_1.CliDebugYield.fatalError("Could not connect to Database!", new Error(err.message));
        }
        return connection;
    }
}
exports.AppDbManager = AppDbManager;
let settings = {
    client: 'mysql',
    debug: false,
    connection: exports.ConnectionSettings
    /*	connection: {
            host : Settings.Database.dbHost,
            user : Settings.Database.dbUser,
            password : Settings.Database.dbPass,
            database : Settings.Database.dbName
        }
    */
};
exports.DbEngine = require('knex')(settings);
