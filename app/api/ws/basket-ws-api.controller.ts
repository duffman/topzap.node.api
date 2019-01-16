/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { IWSApiController }       from '@api/api-controller';
import { IZynSocketServer }       from '@igniter/coldmind/zyn-socket.server';
import { Router }                 from 'express';
import { Logger }                 from '@cli/cli.logger';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { IZynMessage }            from '@igniter/messaging/igniter-messages';
import { ZynMessage }             from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/messages/zap-message-types';
import { MessageType }            from '@igniter/messaging/message-types';
import { BasketHandler }          from '@components/basket/basket.handler';
import { SessionManager }         from '@components/session-manager';
import { MessageFactory }         from '@igniter/messaging/message-factory';
import { IBasketModel }           from '@zapModels/basket/basket.model';
import { ProductDb }              from '@db/product-db';
import { GetOffersInit }          from '@zapModels/messages/get-offers-messages';
import { IVendorOfferData }       from '@zapModels/zap-offer.model';
import { CachedOffersDb }         from '@db/cached-offers-db';
import { Settings }               from '@app/zappy.app.settings';
import { PStrUtils }              from '@putte/pstr-utils';
import { BasketRemItemRes }       from '@zapModels/basket/remove-item-result';
import { IZynSession }            from '@igniter/coldmind/zyn-socket-session';
import { SessionKeys }            from '@app/types/session-keys';
import {ISessionBasket}           from '@zapModels/session-basket';

export class BasketWsApiController implements IWSApiController {
	productDb: ProductDb;
	wss: IZynSocketServer;
	serviceClient: ClientSocket;
	sessManager: SessionManager;
	basketHandler: BasketHandler;
	cachedOffersDb: CachedOffersDb;

	constructor(public debugMode: boolean = false) {
		this.productDb = new ProductDb();
		this.sessManager = new SessionManager();
		this.basketHandler = new BasketHandler();
		this.cachedOffersDb = new CachedOffersDb();
	}

	public attachWSS(wss: IZynSocketServer): void {
		this.wss = wss;
		this.wss.onMessage(this.onClientMessage.bind(this));
	}

	/**
	 * New Message from a User Session/Device
	 * @param {IZynMessage} mess
	 */
	private onClientMessage(session: IZynSession, mess: IZynMessage): void {
		if (mess.id === ZapMessageType.BasketPull) {
			this.onBasketPull(session, mess);
		}

		if (mess.id === ZapMessageType.BasketGet) {
			this.onBasketGet(session, mess);
		}

		if (mess.id === ZapMessageType.BasketRem) {
			this.onBasketRem(session, mess);
		}

		if (mess.id === ZapMessageType.BasketAdd) {
			this.onBasketAdd(session, mess);
		}
	}

	private emitGetOffersInit(sessId: string, data: any): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersInit, data, sessId);
		this.wss.sendToSessionId(sessId, mess);
	}

	private emitVendorOffer(sessId: string, data: any): void {
		Logger.logYellow("¤¤¤¤ emitVendorOffer");
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.VendorOffer, data, sessId);
		Logger.logYellow("¤¤¤¤ emitVendorOffer :: mess ::", mess);
		this.wss.sendToSessionId(sessId, mess);
	}

	private emitOffersDone(sessId: string): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersDone, {}, sessId);
		this.wss.sendToSessionId(sessId, mess);
	}

	/**
	 * Attempt to getAs cached offers
	 * @param {string} code
	 * @param {string} sessId
	 * @param {boolean} fallbalOnSearch
	 */
	private getCachedOffers(code: string, sessId: string, fallbalOnSearch: boolean = true): void {
		let scope = this;
		console.log("########### doGetOffers :: " + code + " :: " + sessId);

		this.cachedOffersDb.getCachedOffers(code).then(res => {
			console.log("########### doGetOffers :: >> 1");

			return res;
		}).catch(err => {
			console.log("########### doGetOffers :: >> 2");

			Logger.logFatalError("BasketWsApiController :: doGetOffers :: Catch ::", err);
			return null;

		}).then((cachedRes: Array<IVendorOfferData>) => {
			//
			// Simulate Messages Sent using a regular lookup
			//
			if (cachedRes) {
				console.log("########### doGetOffers :: cachedRes");

				scope.emitGetOffersInit(sessId, new GetOffersInit(cachedRes.length));

				console.log("########### doGetOffers :: after : emitGetOffersInit");

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

	public doGetOffers(session: IZynSession, mess: IZynMessage): void {
		let code = mess.data.code;
		console.log("### doGetOffers ::", code);

		if (!PStrUtils.isNumeric(code)) {
			Logger.logDebugErr("BasketWsApiController :: doGetOffers ::", code);
			this.wss.sessionError(session, ZapMessageType.ErrInvalidCode, {}, mess.tag);
			return;
		}

		if (Settings.Caching.UseCachedOffers) {
			console.log("### doGetOffers ::", "UseCachedOffers");
			this.getCachedOffers(code, session.sessionId);
		} else {
			console.log("### doGetOffers ::", "SEARCH SERVICE");
			this.emitGetOffersMessage(code, session.sessionId); // Call price service
		}
	}

	private onBasketAdd(session: IZynSession, mess: IZynMessage): void {
		let basket = session.getAs<ISessionBasket>(SessionKeys.Basket);
		console.log(">>>>> onBasketGet", basket);

		if (!basket) {
			console.log(">>>>> handleMessage ::", "Clearing Session");
			session.clear();
		}

		console.log("### onBasketAdd");
		this.doGetOffers(session, mess);
		//this.emitGetOffersMessage(mess.data.code, sessId);
		//mess.ack();
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onBasketGet(session: IZynSession, mess: IZynMessage): void {
		/*console.log("onBasketGet");
		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(sessId);
		mess.replyTyped(ZapMessageType.BasketGet, bestBasket);
		*/

		console.log("onBasketGet");
		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(session);
		console.log("onBasketGet :: bestBasket");
		let messReply = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketGet, bestBasket);

		this.wss.sendToSession(session, messReply);
	}

	/**
	 * Remove item from session baset and re-save
	 * @param {IZynSession} session
	 * @param {IZynMessage} mess
	 */
	private onBasketRem(session: IZynSession, mess: IZynMessage): void {
		let code = mess.data.code;
		let basket = session.getAs<ISessionBasket>(SessionKeys.Basket);
		let res = this.basketHandler.removeItemByCode(code, basket);
		session.set(SessionKeys.Basket, basket);

		Logger.logYellow("REMOVE FROM BASKET :: CODE ::", code);
		mess.replyTyped(ZapMessageType.BasketRemRes, new BasketRemItemRes(res, code));
	}

	/**
	 * Retrieves
	 * @param {string} sessId
	 * @param {IZynMessage} mess
	 */
	private onBasketPull(session: IZynSession, mess: IZynMessage): void {
		let scope = this;
		let attachVendors = mess.data.attachVendors;

		this.basketHandler.getExtSessionBasket(session).then(result => {
			return result;

		}).then(res => {
			console.log(" ");
			console.log("*** onBasketPull (BEFORE) :: message ::", res);
			console.log(" ");

			let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketPull, res);

			console.log("*** onBasketPull (AFTER) :: message ::", message.data);

			console.log(" ");
			console.log("*** onBasketPull :: message ::", message);
			console.log(" ");

			for (let vb of res.data) {
				console.log("*** VENDOR DATA ::", vb);

			}

			this.wss.sendToSession(session, message);

		}).catch(err => {
			mess.error(err);
		});
	}

	private onMessOffersInit(sessId: string): void {
		console.log("BasketWsApiController :: onMessOffersInit ::", sessId);
	}

	private onMessVendorOffer(sessId: string, data: any): void {
		//basket = this.getSessionBasket(sessId);
		//session.setValue(SessionKeys.Basket, basket);

		let session = this.wss.findSocketBySessionId(sessId);
		console.log("BasketWsApiController :: onMessVendorOffer :: " +  sessId + " ::", data);
		this.basketHandler.addToBasket(session, data);

		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(session);
		this.basketHandler.showBasket(session);

		let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketAddRes, bestBasket);
		this.wss.sendToSession(session, message);
	}

	private onMessOffersDone(sessId: string): void {
		console.log("BasketWsApiController :: onMessOffersDone ::", sessId);
	}

	/**
	 * Message from one of the Price Services
	 * @param {IZynMessage} mess
	 */
	private onServiceMessage(mess: IZynMessage): void {
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