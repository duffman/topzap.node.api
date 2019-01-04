/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import {ISocketServer, SocketServer} from '@igniter/coldmind/socket-io.server';
import {ClientSocket, IClientSocket} from '@igniter/coldmind/socket-io.client';
import {IMessage} from '@igniter/messaging/igniter-messages';
import {ZapMessageType} from '@zapModels/messages/zap-message-types';

export class ProductWsApiController implements IWSApiController {
	debugMode: boolean;
	wss: ISocketServer;
	serviceClient: IClientSocket;

	public attachWSS(wss: ISocketServer): void {
		this.wss = wss;
		this.wss.onMessage(this.onUserMessage.bind(this));
	}

	/**
	 * New Message from a User Session/Device
	 * @param {IMessage} mess
	 */
	private onUserMessage(mess: IMessage): void {
		if (mess.id === ZapMessageType.GetVendors) {
		}
	}

	public attachServiceClient(client: IClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	/**
	 * New Message from Search Service
	 * @param {IMessage} mess
	 */
	private onServiceMessage(mess: IMessage): void {
	}

	public initRoutes(routes: any): void {
	}
}