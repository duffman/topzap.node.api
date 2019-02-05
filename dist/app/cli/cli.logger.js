"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
let chalk = require("chalk");
const log = console.log;
const cli_global_1 = require("./cli.global");
var GLogDebugLevel;
(function (GLogDebugLevel) {
    GLogDebugLevel[GLogDebugLevel["Normal"] = 0] = "Normal";
    GLogDebugLevel[GLogDebugLevel["Intense"] = 1] = "Intense";
})(GLogDebugLevel = exports.GLogDebugLevel || (exports.GLogDebugLevel = {}));
class Logger {
    static spit() {
        console.log(" ");
    }
    static log(logMessage, logData = null) {
        if (logData != null) {
            log(chalk.green(logMessage), logData);
        }
        else {
            log(chalk.yellow(logMessage));
        }
    }
    static makeLine(count, char = "-") {
        let line = "";
        for (let i = 0; i < count; i++) {
            line += char;
        }
        return line;
    }
    static logObject(obj, title = null) {
        if (title != null) {
            Logger.logYellow("-- Obj: " + title);
            Logger.logYellow(Logger.makeLine(title.length + 10));
        }
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                Logger.logYellow(key, obj[key]);
            }
        }
    }
    /**
     * Standard Debug Log
     *
     * @param caller - object, used to getAs class name
     * @param logMessage - The message to print
     * @param logData - Optional configureWebServer such as configureWebServer structures
     */
    static logDebugCaller(caller, logMessage, logData = "") {
        if (cli_global_1.CliGlobal.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logDebug(logMessage, logData = "") {
        if (cli_global_1.CliGlobal.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + logMessage), logData);
        }
    }
    static logDebugErr(logMessage, data = null) {
        if (!cli_global_1.CliGlobal.DebugMode)
            return;
        data = data !== null ? JSON.stringify(data) : null;
        if (data === null) {
            log(chalk.red("#ERR :: " + logMessage));
        }
        else {
            log(chalk.red("#ERR :: " + logMessage + " :: " + data));
        }
    }
    static logStd(caller, logMessage, logData = "") {
        if (cli_global_1.CliGlobal.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + logMessage), logData);
        }
    }
    static logAppError(caller, logMessage, logData = "") {
        if (cli_global_1.CliGlobal.DebugMode) {
            log(chalk.red("#ERROR :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logCoreInfo(caller, logMessage, logData = "") {
        if (cli_global_1.CliGlobal.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logSuccessMessage(message, success) {
        if (success) {
            log(chalk.bold.black.bgGreen("# SUCCESS ") + chalk.black.bgGreen(message));
        }
        else {
            log(chalk.bold.white.bgRed("# FAILED ") + chalk.white.bgBlack(message));
        }
    }
    static logExtDebug(level, logMessage) {
        log(chalk.green(logMessage));
    }
    static logWarning(warningMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(this.warning(warningMessage), logData);
    }
    static scream(logMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(chalk.black.underline.bgYellow(logMessage), logData);
    }
    static logFatalErrorMess(errorMessage, logData = "") {
        let data = logData != null ? " ::: " + JSON.stringify(logData) : "";
        log(chalk.white.underline.bgRed(errorMessage + logData));
    }
    static logFatalError(errorMessage, error = null) {
        if (error == null) {
            log(chalk.white.underline.bgRed(errorMessage));
        }
        else {
            log(chalk.white.underline.bgRed(errorMessage), error);
        }
    }
    static logErrorMessage(errorMessage, error = null) {
        if (error == null)
            log(this.error(errorMessage));
        else
            log(this.error(errorMessage), error);
    }
    static logErrorWithStrongWord(begin, strongWord, end) {
        log(chalk.bold.red(begin) + " " + chalk.bold.white.bgRed(strongWord) + " " + chalk.bold.red(begin));
    }
    static logOut(logMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(this.error(logMessage), logData);
    }
    static logError(logMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(this.error(logMessage), logData);
    }
    /**
     *
     * @param {string} logMessage
     * @param logData
     */
    static globalDebug(success, logData = null, ...logMessages) {
        if (!cli_global_1.CliGlobal.Debug.DebugLog)
            return;
        let message = logMessages.join(":::");
        if (success) {
            Logger.logGreen(message, logData);
        }
        else {
            Logger.logRed(message, logData);
        }
    }
    /*****************
     */
    static prepStr(logMessage, logData = null) {
        //console.log("prepStr", "'" + logMessage + "'");
        logData = logData == null ? "" : JSON.stringify(logData);
        return logMessage + " #> " + logData;
    }
    /***********/
    static logGreenPrefix(prefix, logMessage, logData = null) {
        let logStr = Logger.prepStr(logMessage, logData);
        log(chalk.bold.black.bgGreen("#" + prefix + ":") + chalk.greenBright(logStr));
    }
    static logRedPrefix(prefix, logMessage, logData = null) {
        let logStr = Logger.prepStr(logMessage, logData);
        log(chalk.bold.white.bgRed("#" + prefix + ":") + chalk.redBright(logStr));
    }
    /***********/
    static logGreen(logMessage, logData = null) {
        //let logStr = Logger.prepStr(logMessage, logData);
        //log(chalk.greenBright(logStr));
        if (logData) {
            log(chalk.greenBright(logMessage), chalk.greenBright(logData));
        }
        else {
            log(chalk.greenBright(logMessage));
        }
    }
    static logRed(logMessage, logData = null) {
        //console.log("logRed", "'" + logMessage + "'");
        //let logStr = Logger.prepStr(logMessage, logData);
        //log(chalk.redBright(logStr));
        log(chalk.redBright(logMessage), chalk.redBright(logData));
    }
    static logYellow(logMessage, logData = "") {
        log(chalk.yellow(logMessage), logData);
    }
    static logCyan(logMessage, logData = "") {
        log(chalk.cyan(logMessage), logData);
    }
    static logBlue(logMessage, logData = "") {
        log(chalk.blue(logMessage), logData);
    }
    static logPurple(logMessage, logData = null) {
        if (logData == null)
            log(chalk.magenta(logMessage));
        else
            log(chalk.magenta(logMessage), logData);
    }
    static logImportant(prefix, logMessage) {
        log(chalk.bold.white.bgBlue("#" + prefix + ":") + chalk.white.bgMagenta(logMessage));
    }
    static logChainStep(logMessage, step = -1) {
        if (step === -1) {
            log(chalk.white.bgMagenta(logMessage));
            return;
        }
        if (step == 1)
            console.log("");
        log(chalk.bold.white.bgBlue("#" + step + ":") + chalk.white.bgMagenta(logMessage));
    }
    static logMessageHandler(signature, data) {
        log("Message Handler for " + chalk.green(signature) + " : " + chalk.yellow(data));
    }
    static dbError(error) {
        log(this.error(error));
    }
}
Logger.error = chalk.bold.red;
Logger.warning = chalk.bold.yellow;
exports.Logger = Logger;
