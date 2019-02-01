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

import { Settings }               from "@app/zappy.app.settings";
import { Connection }             from 'mysql';
import {DbManager, IConnectionSettings} from '@putteDb/db-kernel';
import {CliDebugYield} from '@cli/cli.debug-yield';

export let ConnectionSettings = {
	host: Settings.Database.dbHost,
	user: Settings.Database.dbUser,
	password: Settings.Database.dbPass,
	database: Settings.Database.dbName
};

export class AppDbManager {
	public static createConnection(): Connection {
		let connection: Connection;

		try {
			connection = DbManager.createConnection(ConnectionSettings);
		} catch (err) {
			CliDebugYield.fatalError("Could not connect to Database!", new Error(err.message))
		}

		return connection;
	}
}

let settings = {
	client: 'mysql',
	debug: false,
	connection: ConnectionSettings
/*	conn: {
		host : Settings.Database.dbHost,
		user : Settings.Database.dbUser,
		password : Settings.Database.dbPass,
		database : Settings.Database.dbName
	}
*/
};






export let DbEngine = require('knex')(settings);
