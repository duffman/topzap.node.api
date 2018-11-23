/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import * as request               from "request"
import * as fs                    from "fs"
import * as querystring           from "querystring";
import { Logger }                 from "@cli/cli.logger";
import {Settings} from "@app/zappy.app.settings";
import {PHttpClient} from "@putte/inet/phttp-client";

export class PriceSearchService {
	constructor() {}

	public doSearch(code: string): Promise<string> {
		let url = Settings.PriceServiceApi.Endpoint + "/" + code;

		return new Promise((resolve, reject) => {
			PHttpClient.getHttp(url).then((res) => {
				Logger.logGreen("PriceSearchService :: doSearch :: success ::", res);
				resolve(res);

			}).catch((err) => {
				Logger.logGreen("PriceSearchService :: doSearch :: error ::", err);
				reject(err);
			});
		});
	}

	public doSearch2(code: string, useProxy: boolean = false): Promise<any> {
		let payload = {
			code: code,
			ext: false
		};
// "http://localhost:6562"
		let options = {
			uri: Settings.PriceServiceApi.Endpoint,
			headers: {
				'User-Agent': 'zapStorm/36.3',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		};

		let scope = this;

		return new Promise((resolve, reject) => {
			return request.post(options, { payload }, (error: any, response: any, body: any) => {

				if (!error && response.statusCode == 200) {
					Logger.logGreen("Success", body);
					resolve(body);
				}
				else {
					Logger.logError("PostRequest :: Error", error);
					reject(error);
				}
			});
		});
	}
}