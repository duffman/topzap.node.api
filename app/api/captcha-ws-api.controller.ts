/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { IWSApiController }       from '@api/api-controller';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import {IMessage} from '@igniter/messaging/igniter-messages';
import {ZapMessageType} from '@zapModels/zap-message-types';

export class CaptchaWsApiController implements IWSApiController {
	debugMode: boolean;
	wss: ISocketServer;
	serviceClient: ClientSocket;

	public attachWSS(wss: ISocketServer): void {
		this.wss = wss;
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onServiceMessage(mess: IMessage): void {
		if (mess.id === ZapMessageType.GCaptchaVerify) {
		}
	}

	public initRoutes(routes: any): void {}
}
