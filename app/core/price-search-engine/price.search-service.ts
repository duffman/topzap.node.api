/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import * as request               from "request";
import { SearchResult }           from "@models/search-result";
import { Settings }               from "@app/zappy.app.settings";
import { Logger }                 from "@cli/cli.logger";

export class PriceSearchService {
	private searchRequest: request;

	constructor() {
		this.searchRequest = request.defaults({
			baseUrl: Settings.PriceServiceApi.Endpoint,
			'headers': {
				'User-Agent': 'zapStorm/36.3',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			'gzip': false,
			'json': false
		});
	}

	public doSearch(code: string): Promise<string> {
		return new Promise((resolve, reject) => {
			let payload = {
				code: code,
				ext: false
			};

			this.searchRequest.post({data: payload}, (err, httpResponse, resultData) => {
				if (err) {
					reject(err);
				} else {
					try {
						console.log("body", resultData);
						console.log("httpResponse", httpResponse);
						console.log("resultData", resultData);
						resolve(resultData);
					}
					catch (err) {
						resolve(null);
					}
				}
			});
		});
	}
}

/*
	public generateToken(): Promise<string> {
		return new Promise((resolve, reject) => {
			this.searchRequest.post('token.svc/tokenW/GenerateTokenApps', {
				'body': {
					'c': 1,
					'd': uuidv1()
				}
			}, (err, httpResponse, body) => {
				if (err) {
					reject(err);
				} else {
					let resultData: string;

					try {
						//resultData = Convert.toMusicMagpieTokenResult(body);

						resolve(resultData);
					}
					catch (err) {
						resolve(null);
					}
				}
			});
		});
	}

 */
