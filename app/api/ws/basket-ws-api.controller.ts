/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import { ISocketServer }          from '@igniter/coldmind/socket-io.server';
import { Router }                 from 'express';
import { Logger }                 from '@cli/cli.logger';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { IgniterMessage }         from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/messages/zap-message-types';
import { MessageType }            from '@igniter/messaging/message-types';
import { BasketHandler }          from '@components/basket/basket.handler';
import { SessionManager }         from '@components/session-manager';
import { MessageFactory }         from '@igniter/messaging/message-factory';
import { IBasketModel }           from '@zapModels/basket.model';
import { ProductDb }              from '@db/product-db';
import { GetOffersInit }          from '@zapModels/messages/get-offers-messages';
import { IVendorOfferData }       from '@zapModels/zap-offer.model';
import { CachedOffersDb }         from '@db/cached-offers-db';
import {Settings} from '@app/zappy.app.settings';
import {PStrUtils} from '@putte/pstr-utils';

export class BasketWsApiController implements IWSApiController {
	productDb: ProductDb;
	wss: ISocketServer;
	serviceClient: ClientSocket;
	sessManager: SessionManager;
	basketHandler: BasketHandler;

	cachedOffersDb: CachedOffersDb;

	constructor(public debugMode: boolean = false) {
		this.productDb = new ProductDb();
		this.sessManager = new SessionManager();
		this.basketHandler = new BasketHandler(this.sessManager);
		this.cachedOffersDb = new CachedOffersDb();
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

	/**
	 * Attempt to get cached offers
	 * @param {string} code
	 * @param {string} sessId
	 * @param {boolean} fallbalOnSearch
	 */
	private getCachedOffers(code: string, sessId: string, fallbalOnSearch: boolean = true): void {
		let scope = this;
		console.log("doGetOffers :: " + code + " :: " + sessId);

		this.cachedOffersDb.getCachedOffers(code).then(res => {
			return res;
		}).catch(err => {
			console.log("BasketWsApiController :: doGetOffers :: Catch ::", err);
			return null;

		}).then((cachedRes: Array<IVendorOfferData>) => {
			//
			// Simulate Messages Sent using a regular lookup
			//
			if (cachedRes) {
				scope.emitGetOffersInit(sessId, new GetOffersInit(cachedRes.length));
				for (const entry of cachedRes) {
					scope.onMessVendorOffer(sessId, entry);
					//scope.emitVendorOffer(sessId, entry);
				}
				scope.emitOffersDone(sessId)

				//
				// Lookup offers through the price service
				//
			} else if (fallbalOnSearch) {
				scope.emitGetOffersMessage(code, sessId); // Call price service
			}
		});
	}

	public doGetOffers(sessId: string, mess: IMessage): void {
		let code = mess.data.code;

		if (!PStrUtils.isNumeric(code)) {
			Logger.logDebugErr("BasketWsApiController :: doGetOffers ::", code);
			this.wss.sendError(sessId, ZapMessageType.ErrInvalidCode, {}, mess.tag);
			return;
		}

		if (Settings.Caching.UseCachedOffers) {
			this.getCachedOffers(code, sessId);
		} else {
			this.emitGetOffersMessage(code, sessId); // Call price service
		}
	}

	private onBasketAdd(sessId: string, mess: IMessage): void {
		this.doGetOffers(sessId, mess);
		//this.emitGetOffersMessage(mess.data.code, sessId);
		mess.ack();
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onBasketGet(sessId: string): void {
		console.log("onBasketGet");
		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
		console.log("onBasketGet :: bestBasket");
		let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketGet, bestBasket);
		this.wss.sendToSession(sessId, message);
	}

	private onBasketRem(sessId: string, data: any): void {
		let code = data.code;
		Logger.logYellow("REMOVE FROM BASKET :: CODE ::", code);
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
