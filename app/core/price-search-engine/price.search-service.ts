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
import { ZapMessageType }         from '@zapModels/zap-message-types';
import {DbManager} from '@putteDb/database-manager';
import {ProductDb} from '@db/product-db';

export interface IPriceSearchService {
	doSearch(code: string): Promise<string>;
	doPriceSearch(code: string): Promise<IMessage>;
}

export class PriceSearchService implements IPriceSearchService {
	db: DbManager;
	productDb: ProductDb;
	serviceClient: IgniterClientSocket;

	constructor() {
		this.serviceClient = new IgniterClientSocket();
		this.serviceClient.connect();

		this.serviceClient.onMessage((message: any) => {
			console.log("New Message ::", message);
		});
	}

	public doPriceSearch(code: string, sessId: string = null): Promise<IMessage> {
		let messageData = {
			code: code
		};

		return this.serviceClient.sendAwaitMessage(MessageType.Action, ZapMessageType.GetOffers, messageData, sessId);
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
