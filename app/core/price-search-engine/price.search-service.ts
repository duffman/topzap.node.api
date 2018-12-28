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
import { IgniterClientSocket }    from '@igniter/coldmind/socket-io.client';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { MessageType }            from '@igniter/messaging/message-types';
import {ZapMessageType} from '@zapModels/zap-message-types';

export interface IPriceSearchService {
	doDebugSearch(code: string): Promise<string>;
	doSearch(code: string): Promise<string>;
	doPriceSearch(code: string): Promise<IMessage>;
}

export class PriceSearchService implements IPriceSearchService {
	serviceClient: IgniterClientSocket;

	constructor() {
		this.serviceClient = new IgniterClientSocket();
		this.serviceClient.connect();

		this.serviceClient.onMessage((message: any) => {
			console.log("New Message ::", message);
		});
	}

	public doDebugSearch(code: string): Promise<string> {
		Logger.logYellow("** DoDebugSearch ::");

		const debugResult = '{"highOffer":0,"vendors":[{"vendorId":12,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion for Nintendo Switch","offer":"2.85","rawData":null},{"vendorId":11,"accepted":true,"title":"Adventure Time: Pirates of the","offer":"15","rawData":null},{"vendorId":15,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion for Nintendo Switch","offer":"0.05","rawData":null},{"vendorId":13,"accepted":true,"title":"Adventure Time: Pirates of the Enchiridion","offer":"0.88","rawData":null}]}';

		return new Promise((resolve, reject) => {
			resolve(debugResult);
		});
	}

	public doPriceSearch(code: string): Promise<IMessage> {
		let messageData = {
			code: code
		};

		return this.serviceClient.sendMessage(MessageType.Action, ZapMessageType.GetOffers, messageData);
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
}
