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
 *
 * Created by Patrik Forsberg - 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const miner_api_1 = require("@api/miner-api");
class Main {
    constructor() {
        this.minerServer = new miner_api_1.MinerServerApi();
        /*
        public init(): Promise<MinerSessionModel> {
            return new Promise((resolve, reject) => {
                this.minerServer.aquireSession(7, "Test").then((res) => {
    
                });
            }).catch((err) => {
                Logger.logError("Error getting session ::", err);
            });
        }
        */
    }
}
exports.Main = Main;
/*
let item = new MinerWorkItemUpdate(
    4,
    res.id,
    true,
    56.12,
    "form.message"
);

minerServer.updateWorkItem(item).then((res) => {
    console.log("updateWorkItem ::", res);
});
*/
/*
minerServer.getWorkQueue(res.id, 10).then((queue) => {
    console.log("QUEUE", queue);
});
*/
//Logger.logGreen("Session :: success :: >>");
