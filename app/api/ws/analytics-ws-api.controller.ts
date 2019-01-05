/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import { SocketServer }           from '@igniter/coldmind/socket-io.server';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { AnalyticsDb }            from '@db/analytics-db';
import { ZapMessageType }         from '@zapModels/messages/zap-message-types';
import { Logger }                 from '@cli/cli.logger';

export class AnalyticsWsApiController implements IWSApiController {
	wss: ISocketServer;
	serviceClient: ClientSocket;
	analyticsDb: AnalyticsDb;

	constructor(public debugMode: boolean) {
		this.analyticsDb = new AnalyticsDb();
		console.log("********* AnalyticsWsApiController");
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onServiceMessage(mess: IMessage): void {
		let scope = this;
	}

	public attachWSS(wss: SocketServer): void {
		this.wss = wss;

		this.wss.onMessage((mess: IMessage) => {
			let sessId = mess.socket.request.sessionID;

			if (mess.id === ZapMessageType.BasketAdd) {
				console.log("********* AnalyticsWsApiController :: ZapMessageType.BasketAdd");
				this.onBasketAdd(sessId, mess);
			}
		});
	}

	/**
	 * Intercept the basket add message to add new zap
	 * @param {string} sessId
	 * @param {IMessage} mess
	 */
	public onBasketAdd(sessId: string, mess: IMessage): void {
		Logger.logGreen("AnalyticsWsApiController :: onBasketAdd");
		let code = mess.data.code;

		this.analyticsDb.doZap(code).then(res => {
			Logger.logGreen("AnalyticsWsApiController :: onBasketAdd :: doZap ::", res);
		}).catch(err => {
			Logger.logGreen("AnalyticsWsApiController :: onBasketAdd :: err ::", err);
		})
	}

	public initRoutes(routes: any): void {}
}
