"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const log = console.log;
class DbLogger {
    static logErrorMessage(errorMessage, error = null) {
        if (error == null)
            log(this.error(errorMessage));
        else
            log(this.error(errorMessage), error);
    }
}
DbLogger.error = chalk_1.default.bold.red;
DbLogger.warning = chalk_1.default.bold.yellow;
exports.DbLogger = DbLogger;
