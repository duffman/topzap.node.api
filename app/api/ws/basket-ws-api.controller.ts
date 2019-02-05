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
import { ISessionBasket }         from '@zapModels/session-basket';


export function FatLine(mess: string = "") {
	console.log(" ");
	console.log("===================================================");
	console.log(" ");
}


export function LogFat(mess: string) {
	console.log(" ");
 	console.log("=============== " + mess + " ====================");
	console.log(" ");
}


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

	//
	private emitGetOffersInit(socketId: string, data: any): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersInit, data, socketId);
		this.wss.sendMessageToSocket(socketId, mess);
	}

	private emitVendorOffer(socketId: string, data: any): void {
		Logger.logYellow("¤¤¤¤ emitVendorOffer");
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.VendorOffer, data, socketId);
		Logger.logYellow("¤¤¤¤ emitVendorOffer :: mess ::", mess);
		this.wss.sendMessageToSocket(socketId, mess);
	}

	private emitOffersDone(socketId: string): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersDone, {}, socketId);
		this.wss.sendMessageToSocket(socketId, mess);
	}

	private getSessionBasket(session: IZynSession): ISessionBasket {
		let attempt1 = session.get(SessionKeys.Basket) as ISessionBasket;
		let attempt2 = session.getAs<ISessionBasket>(SessionKeys.Basket);
		let attempt3 = session.get (SessionKeys.Basket);

		/*
		LogFat("Session Basket Get");

		if (attempt1) {
			FatLine();
			console.log("ATTEMPT 1", attempt1);
		}
		if (attempt2) {
			FatLine();
			console.log("ATTEMPT 2", attempt2);
		}
		if (attempt3) {
			FatLine();
			console.log("ATTEMPT 3 ", attempt3);
		}
		*/

		return null;
	}

	private getCachedOfferData(code: string) {
		return new Promise((resolve, reject) => {
		});
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
			return res;
		}).catch(err => {
			Logger.logFatalError("BasketWsApiController :: doGetOffers :: Catch ::", err);
			return null;

		}).then((cachedRes: Array<IVendorOfferData>) => {
			//
			// Simulate Messages Sent using a regular lookup
			//
			if (cachedRes && cachedRes.length > 0) {
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
		console.log("###################### ALLAN ################################");

		let code = mess.data.code;
		console.log("### doGetOffers ::", code);

		/*if (!PStrUtils.isNumeric(code)) {
			Logger.logDebugErr("BasketWsApiController :: doGetOffers ::", code);
			this.wss.messError(session.id, mess, new Error("messZapMessageType.ErrInvalidCode"));
			return;
		}*/

		if (Settings.Caching.UseCachedOffers) {
			console.log("### doGetOffers ::", "UseCachedOffers");
			this.getCachedOffers(code, session.id);


		} else {
			console.log("### doGetOffers ::", "SEARCH SERVICE");
			this.emitGetOffersMessage(code, session.id); // Call price service
		}
	}

	// 08 123 40 000

	/**
	 * Basket Add Handler
	 * @param {IZynSession} session
	 * @param {IZynMessage} mess
	 */
	private onBasketAdd(session: IZynSession, mess: IZynMessage): void {
		let basket = this.getSessionBasket(session);
		console.log(">>>>> onBasketGet", basket);

		if (!basket) {
			console.log(">>>>> handleMessage ::", "Clearing Session");
			//session.clear(); // <-- WATCH OUT for this bug, if clearing the session only one item at a time will be visible
		}

		console.log("### onBasketAdd");
		this.doGetOffers(session, mess);
		//this.emitGetOffersMessage(mess.data.code, sessId);
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

		// WHY?
		let zynMessage = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketGet, bestBasket);
		this.wss.sendMessageToSocket(session.id, zynMessage);
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

		let zynMessage = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketRemRes, new BasketRemItemRes(res, code));
		this.wss.sendMessageToSocket(session.id, zynMessage);
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

			this.wss.sendMessageToSocket(session.id, message);

		}).catch(err => {
			this.wss.messError(session.id, mess, new Error("Error Pulling Basket"));
		});
	}

	private onMessOffersInit(sessId: string): void {
		console.log("BasketWsApiController :: onMessOffersInit ::", sessId);
	}

	/**
	 * Vendor offer have been returned from the search service, now we
	 * need to route it back to the requesting client...
	 * @param {string} socketId
	 * @param data
	 */
	private onMessVendorOffer(socketId: string, data: any): void {
		//basket = this.getSessionBasket(socketId);
		//session.setValue(SessionKeys.Basket, basket);

		let session = this.wss.getSessionBySocketId(socketId);

		//console.log("getSessionBySocketId :: session ::", session.);

		console.log("BasketWsApiController :: onMessVendorOffer :: " +  socketId + " ::", data);

		this.basketHandler.addToBasket(session, data);

		let bestBasket: IBasketModel = this.basketHandler.getBestBasket(session);
		this.basketHandler.showBasket(session);

		let message = MessageFactory.newIgniterMessage(MessageType.Action, ZapMessageType.BasketAddRes, bestBasket);
		this.wss.sendMessageToSocket(socketId, message);
	}

	private onMessOffersDone(socketId: string): void {
		console.log("BasketWsApiController :: onMessOffersDone ::", socketId);
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