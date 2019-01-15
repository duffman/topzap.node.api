"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_manager_1 = require("@putteDb/database-manager");
const cli_logger_1 = require("@cli/cli.logger");
const ZapCounterTable = "zap_counter";
class AnalyticsDb {
    constructor() {
        this.db = new database_manager_1.DbManager();
        console.log("********* AnalyticsDb");
    }
    /**
     * Push new Zap, increase counter
     * @param {string} code
     */
    doZap(code) {
        let scope = this;
        let result = false;
        console.log("********* doZap");
        /*
        function haveItem(): Promise<boolean> {
            let sql = `SELECT COUNT(*) AS count FROM zap-counter WHERE code='${code}'`;
            return new Promise((resolve, reject) => {
                scope.db.dbQuery(sql).then(res => {
                    let row res
                });
            });
        }
        */
        function updateRow() {
            let sql = `UPDATE ${ZapCounterTable} SET zaps=zaps+1 WHERE code='${code}'`;
            return new Promise((resolve, reject) => {
                scope.db.dbQuery(sql).then(res => {
                    resolve(true);
                }).catch(err => {
                    // Do not throw, just resolve and forget
                    resolve(false);
                });
            });
        }
        function addRow() {
            let sql = `INSERT INTO ${ZapCounterTable} (code, zaps, last_zap) VALUES ('${code}', 1, CURRENT_TIMESTAMP)`;
            return new Promise((resolve, reject) => {
                scope.db.dbQuery(sql).then(res => {
                    resolve(true);
                }).catch(err => {
                    // Do not throw, just resolve and forget
                    resolve(false);
                });
            });
        }
        async function execute() {
            let count = await scope.db.countRows(ZapCounterTable, "code", `='${code}'`);
            try {
                if (count > 0) {
                    await updateRow();
                }
                else {
                    await addRow();
                }
            }
            catch (err) {
                cli_logger_1.Logger.logError("AnalyticsDb :: doZap ::", err);
                result = false;
            }
        }
        return new Promise((resolve, reject) => {
            execute().then(() => {
                resolve(result);
            });
        });
    }
}
exports.AnalyticsDb = AnalyticsDb;
