"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@db/database-manager");
const miner_db_1 = require("@miner/miner-db");
class DbTest {
    constructor() {
        this.minerDb = new miner_db_1.MinerDb();
    }
    execute() {
        let scope = this;
        let db = new database_manager_1.DbManager();
        scope.minerDb.checkOutWorkQueue(29, 10).then((res) => {
            console.log("RES ::", res);
        }).catch((err) => {
            console.log("CATCH ::", err);
        });
        /*
        scope.minerDb.getWorkQueue(29, 10).then((res) => {
            let idList = new Array<string>();

            for (let i = 0; i < res.length; i++) {
                let item = res[i];
                let entry = `id=${item.id}`;
                idList.push(entry);
            }

            let sqlString = "UPDATE price_miner_queue SET checkout_time=NOW() WHERE " + idList.join(" OR ");
            console.log(sqlString);
        });
        */
        /*
        db.runInTransaction("SELECT * FROM price_miner_queue").then((res) => {
            console.log("RES", res);
        });
        */
    }
}
exports.DbTest = DbTest;
let app = new DbTest();
app.execute();
