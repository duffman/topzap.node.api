"use strict";
// Create Test Session Basket
Object.defineProperty(exports, "__esModule", { value: true });
const db_kernel_1 = require("@putteDb/db-kernel");
const zappy_app_settings_1 = require("@app/zappy.app.settings");
const log = console.log;
class SessBasketTest {
    constructor() {
        console.log("SessBasketTest", "constructor");
        this.db = new db_kernel_1.DbManager(zappy_app_settings_1.Settings.Database.dbHost, zappy_app_settings_1.Settings.Database.dbUser, zappy_app_settings_1.Settings.Database.dbPass, zappy_app_settings_1.Settings.Database.dbName);
    }
    doRun() {
        this.db.showDebugInfo();
        let connection = this.db.getConnection();
        let sql = "SELECT * FROM product_edition LIMIT 1";
        let conn = this.db.getConnection();
        //conn.destroy();
        conn.query(sql, (error, result, tableFields) => {
            if (error) {
                console.log("ERROR ::", error);
                if (error.fatal) {
                    console.trace('fatal error: ' + error.message);
                }
            }
            else {
                console.log("result", result);
                /*
                return this.parseMysqlQueryResult(error, result, tableFields).then((res) => {

                    if (error) {
                        console.log("FET ERROR ::", error);

                    }
                }).catch((err) => {
                    reject(err);
                });
                */
            }
        });
    }
}
exports.SessBasketTest = SessBasketTest;
function execute() {
    let app = new SessBasketTest();
    app.doRun();
}
execute();
/*
db.dbQuery("SELECT * FROM session").then(res => {
    log("Rows ::", res.result);

}).catch(err => {
    log("ERROR :: ", err);
});
*/
