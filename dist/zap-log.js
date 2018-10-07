"use strict";
/**
 * COLDMIND LTD ("COMPANY") CONFIDENTIAL
 * Unpublished Copyright (c) 2015-2017 COLDMIND LTD, All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains the property of COMPANY. The intellectual and technical concepts contained
 * herein are proprietary to COMPANY and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from COMPANY.  Access to the source code contained herein is hereby forbidden to anyone except current COMPANY employees, managers or contractors who have executed
 * Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 * The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 * information that is confidential and/or proprietary, and is a trade secret, of  COMPANY.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 * OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 * LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 * Created by Patrik Forsberg on 2017
 */
Object.defineProperty(exports, "__esModule", { value: true });
let chalk = require("chalk");
const log = console.log;
const server_global_1 = require("./server-global");
var GLogDebugLevel;
(function (GLogDebugLevel) {
    GLogDebugLevel[GLogDebugLevel["Normal"] = 0] = "Normal";
    GLogDebugLevel[GLogDebugLevel["Intense"] = 1] = "Intense";
})(GLogDebugLevel = exports.GLogDebugLevel || (exports.GLogDebugLevel = {}));
class GLog {
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
    /**
     * Standard Debug Log
     *
     * @param caller - object, used to get class name
     * @param logMessage - The message to print
     * @param logData - Optional data such as data structures
     */
    static logDebug(caller, logMessage, logData = "") {
        if (server_global_1.Global.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logAppError(caller, logMessage, logData = "") {
        if (server_global_1.Global.DebugMode) {
            log(chalk.red("#ERROR :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logCoreInfo(caller, logMessage, logData = "") {
        if (server_global_1.Global.DebugMode) {
            log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
        }
    }
    static logExtDebug(level, logMessage) {
        log(chalk.green(logMessage));
    }
    /**
     *
     * @param warningMessage
     */
    static logWarning(warningMessage) {
        log(this.warning(warningMessage));
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
    static logError(logMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(this.error(logMessage), logData);
    }
    static logGreen(logMessage, logData = null) {
        logData = logData == null ? "" : logData;
        log(chalk.green(logMessage), logData);
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
    static logMessageHandler(signature, data) {
        log("Message Handler for " + chalk.green(signature) + " : " + chalk.yellow(data));
    }
    static dbError(error) {
        log(this.error(error));
    }
}
GLog.error = chalk.bold.red;
GLog.warning = chalk.bold.orange;
exports.GLog = GLog;
