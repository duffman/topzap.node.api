'use strict';Object.defineProperty(exports,'__esModule',{value:true});const zappy_app_settings_1=require('../app/zappy.app.settings');const db_kernel_1=require('../lib/putte-db/db-kernel');const cli_debug_yield_1=require('../app/cli/cli.debug-yield');exports.ConnectionSettings={host:zappy_app_settings_1.Settings.Database.dbHost,user:zappy_app_settings_1.Settings.Database.dbUser,password:zappy_app_settings_1.Settings.Database.dbPass,database:zappy_app_settings_1.Settings.Database.dbName};class AppDbManager{static createConnection(){let connection;try{connection=db_kernel_1.DbManager.createConnection(exports.ConnectionSettings);}catch(err){cli_debug_yield_1.CliDebugYield.fatalError('Could not connect to Database!',new Error(err.message));}return connection;}}exports.AppDbManager=AppDbManager;let settings={client:'mysql',debug:false,connection:exports.ConnectionSettings};exports.DbEngine=require('knex')(settings);