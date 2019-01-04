/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IClientSocket }          from '@igniter/coldmind/socket-io.client';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import {ZapMessageType} from '@zapModels/messages/zap-message-types';
import {MessageType} from '@igniter/messaging/message-types';
import {IgniterMessage} from '@igniter/messaging/igniter-messages';

export class PriceOfferManager {
	constructor(public serviceClient: IClientSocket,
				public wss: ISocketServer) {}

	private emitGetOffersInit(sessId: string, data: any): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.GetOffersInit, data, sessId);
		this.wss.sendToSession(sessId, mess);
	}

	private emitVendorOffer(sessId: string, data: any): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.VendorOffer, data, sessId);
		this.wss.sendToSession(sessId, mess);
	}

	private emitOffersDone(sessId: string): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.GetOffersDone, {}, sessId);
		this.wss.sendToSession(sessId, mess);
	}
}