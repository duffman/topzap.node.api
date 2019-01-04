/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import { SocketServer}            from '@igniter/coldmind/socket-io.server';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/messages/zap-message-types';
import { ProductDb }              from '@db/product-db';
import { MessageType }            from '@igniter/messaging/message-types';

export class ServiceWsApiController implements IWSApiController {
	wss: ISocketServer;
	serviceClient: ClientSocket;
	productDb: ProductDb;

	constructor(public debugMode: boolean) {
		this.productDb = new ProductDb();
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
		this.wss.onMessage(this.onUserMessage.bind(this));
	}

	private onUserMessage(mess: IMessage): void {
		let scope = this;

		if (mess.id === ZapMessageType.GetVendors) {
			this.productDb.getVendors().then(res => {
				mess.reply(MessageType.Action, ZapMessageType.VendorsList, res);
			}).catch(err => {
				mess.error(err);
			});
		}
	}

	public initRoutes(routes: any): void {}
}
