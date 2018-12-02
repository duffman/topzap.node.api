/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import * as request               from "request"
import * as fs                    from "fs"
import * as querystring           from "querystring";
import { Logger }                 from "@cli/cli.logger";
import { Settings }               from "@app/zappy.app.settings";
import { PHttpClient }            from "@putte/inet/phttp-client";


export interface IPriceSearchService {
	doDebugSearch(code: string): Promise<string>;
	doSearch(code: string): Promise<string>;
}

export class PriceSearchService implements IPriceSearchService {
	constructor() {}

	public doDebugSearch(code: string): Promise<string> {
		Logger.logYellow("** DoDebugSearch ::");

		const debugResult = '{"highOffer":0,"vendors":[{"vendorId":12,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion for Nintendo Switch","offer":"2.85","rawData":null},{"vendorId":11,"accepted":true,"title":"Adventure Time: Pirates of the","offer":"15","rawData":null},{"vendorId":15,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion for Nintendo Switch","offer":"0.05","rawData":null},{"vendorId":13,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion","offer":"0.88","rawData":null}]}';

		return new Promise((resolve, reject) => {
			resolve(debugResult);
		});
	}

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
			return request.post(Settings.PriceServiceApi.Endpoint, // <- (Nu mer vaken än i Visby) - testa att sikta den mot URLén
				options, { payload }, (error: any, response: any, body: any) => {

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
