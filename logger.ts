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

let chalk = require("chalk");
const log = console.log;
import { Global } from "./global";

export enum GLogDebugLevel {
	Normal,
	Intense
}

export class Logger {
	private static error = chalk.bold.red;
	private static warning = chalk.bold.yellow;

	public static spit() {
		console.log(" ");
	}

	public static log(logMessage: string, logData: any = null) {
		if (logData != null) {
			log(chalk.green(logMessage), logData);
		} else {
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
	public static logDebug(caller: any, logMessage: string, logData: any = "") {
		if (Global.DebugMode) {
			//log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
		}
	}

	public static logStd(logMessage: string, logData: any = "") {
		if (Global.DebugMode) {
			//log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
		}
	}

	public static logAppError(caller: any, logMessage: string, logData: any = "") {
		if (Global.DebugMode) {
			log(chalk.red("#ERROR :: " + caller.constructor.name + " :: " + logMessage), logData);
		}
	}

	public static logCoreInfo(caller: any, logMessage: string, logData: any = "") {
		if (Global.DebugMode) {
			log(chalk.cyan("#DEBUG :: " + caller.constructor.name + " :: " + logMessage), logData);
		}
	}

	public static logExtDebug(level: GLogDebugLevel, logMessage: string) {
		log(chalk.green(logMessage));
	}

	public static logWarning(warningMessage: string, logData: any = null) {
		logData = logData == null ? "" : logData;
		log(this.warning(warningMessage), logData);
	}

	public static logFatalError(errorMessage: string, error: Error = null) {
		if (error == null) {
			log(chalk.white.underline.bgRed(errorMessage));
		}
		else {
			log(chalk.white.underline.bgRed(errorMessage), error);
		}
	}

	public static logErrorMessage(errorMessage: string, error: Error = null) {
		if (error == null)
			log(this.error(errorMessage))
		else
			log(this.error(errorMessage), error);
	}

	public static logErrorWithStrongWord(begin: string, strongWord: string, end: string) {
		log(chalk.bold.red(begin) + " " + chalk.bold.white.bgRed(strongWord) + " " + chalk.bold.red(begin));
	}

	public static logUndefinedError(prefix: string, name: string): void {
		Logger.logErrorWithStrongWord(prefix + " :: ", name, " :: is Undefined");
	}

	public static logError(logMessage: string, logData: any = null) {
		logData = logData == null ? "" : logData;
		log(this.error(logMessage), logData);
	}

	public static logGreen(logMessage: string, logData: any = null) {
		logData = logData == null ? "" : logData;
		log(chalk.green(logMessage), logData);
	}

	public static logYellow(logMessage: string, logData: any = "") {
		log(chalk.yellow(logMessage), logData);
	}

	public static logCyan(logMessage: string, logData: any = "") {
		log(chalk.cyan(logMessage), logData);
	}

	public static logBlue(logMessage: string, logData: any = "") {
		log(chalk.blue(logMessage), logData);
	}

	public static logPurple(logMessage: string, logData: any = null) {
		if (logData == null)
			log(chalk.magenta(logMessage));
		else
			log(chalk.magenta(logMessage), logData);
	}

	public static logImportant(prefix: string, logMessage: string) {
		log(chalk.bold.white.bgBlue("#" + prefix + ":") + chalk.white.bgMagenta(logMessage));
	}

	public static logChainStep(logMessage: string, step: number = -1) {
		if (step === -1) {
			log(chalk.white.bgMagenta(logMessage));
			return;
		}

		if (step == 1) console.log("");
		log(chalk.bold.white.bgBlue("#" + step + ":") + chalk.white.bgMagenta(logMessage));

	}


	public static logMessageHandler(signature: string, data: string) {
		log("Message Handler for " + chalk.green(signature) + " : " + chalk.yellow(data));
	}

	public static dbError(error: any) {
		log(this.error(error));
	}
}
