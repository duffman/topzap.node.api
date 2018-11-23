/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import {PHttpClient} from "@putte/inet/phttp-client";
import {Logger} from "@cli/cli.logger";

export class PriceSearchIntegration {
	public getZap(reqUrl: string, barcode: string): Promise<string> {
		return new Promise((resolve, reject) => {
			PHttpClient.getHttp(reqUrl).then((res) => {
				Logger.logGreen("getMinerServerSession :: success ::", res);
				resolve(res);

			}).catch((err) => {
				Logger.logGreen("getMinerServerSession :: error ::", err);
				reject(err);
			});
		});
	}

}