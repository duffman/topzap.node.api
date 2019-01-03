/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import { Router }                 from 'express';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/zap-message-types';
import { MessageType }            from '@igniter/messaging/message-types';
import { BasketHandler }          from '@components/basket/basket.handler';
import { SessionManager }         from '@components/session-manager';
import { MessageFactory }         from '@igniter/messaging/message-factory';
import { IBasketModel }           from '@zapModels/basket.model';
import { ProductDb }              from '@db/product-db';
import {SessionPullResult} from '@zapModels/messages/session-pull-result';

export class BasketWsApiController implements IWSApiController {
	productDb: ProductDb;
	wss: ISocketServer;
	serviceClient: ClientSocket;
	sessManager: SessionManager;
	basketHandler: BasketHandler;

	constructor(public debugMode: boolean = false) {
		this.productDb = new ProductDb();
		this.sessManager = new SessionManager();
		this.basketHandler = new BasketHandler(this.sessManager);
	}

	public attachWSS(wss: ISocketServer): void {
		this.wss = wss;

		this.wss.onMessage((mess: IMessage) => {
			let sessId =  mess.socket.request.sessionID;

			if (mess.id === ZapMessageType.BasketPull) {
				this.onBasketPull(sessId, mess);
			}

			if (mess.id === ZapMessageType.BasketGet) {
				this.onBasketGet(sessId);
			}

			if (mess.id === ZapMessageType.BasketRem) {
				this.onBasketRem(sessId, mess.data);
			}

			if (mess.id === ZapMessageType.BasketAdd) {
				this.onBasketAdd(sessId, mess);
			}
		});
	}

	private onBasketAdd(sessId: string, mess: IMessage): void {
		this.emitGetOffersMessage(mess.data.code, sessId);
		mess.ack();
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onServiceMessage(mess: IMessage): void {
		let scope = this;

		if (mess.id === ZapMessageType.GetOffersInit) {
			this.onMessOffersInit(mess.tag)
		}

		if (mess.id === ZapMessageType.VendorOffer) {
			this.onMessVendorOffer(mess.tag, mess.data);
		}

		if (mess.id === ZapMessageType.GetOffersDone) {
			this.onMessOffersDone(mess.tag);
		}
	}

	private onBasketGet(sessId: string): void {
		console.log("onBasketGet");
		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
		console.log("onBasketGet :: bestBasket");
		let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketGet, bestBasket);
		this.wss.sendToSession(sessId, message);
	}

	private onBasketRem(sessId: string, data: any): void {
	}

	private onBasketPull(sessId: string, mess: IMessage): void {
		this.basketHandler.getExtSessionBasket(sessId).then(result => {
			let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketPull, result);
			this.wss.sendToSession(sessId, message);
		}).catch(err => {
			mess.error(err);
		});
	}

	private onMessOffersInit(sessId: string): void {
		console.log("BasketWsApiController :: onMessOffersInit ::", sessId);
	}

	private onMessVendorOffer(sessId: string, data: any): void {
		console.log("BasketWsApiController :: onMessVendorOffer :: " +  sessId + " ::", data);
		this.basketHandler.addToBasket(sessId, data);

		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
		this.basketHandler.showBasket(sessId);

		let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketAddRes, bestBasket);
		this.wss.sendToSession(sessId, message);
	}

	private onMessOffersDone(sessId: string): void {
		console.log("BasketWsApiController :: onMessOffersDone ::", sessId);
	}

	/**
	 * Emit Search Message through Search Service
	 * @param {string} code
	 * @param {string} sessId
	 */
	private emitGetOffersMessage(code: string, sessId: string): void {
		let messageData = { code: code };
		this.serviceClient.sendMessage(MessageType.Action, ZapMessageType.GetOffers, messageData, sessId);
	}

	public initRoutes(routes: Router): void {}
}
