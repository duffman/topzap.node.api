/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Logger }                 from "@cli/cli.logger";
import { Express, Router}         from "express";
import { Request, Response }      from 'express';
import { Settings }               from "@app/zappy.app.settings";
import { IApiController }         from "@api/api-controller";
import { ApiControllerUtils }     from "@api/controller.utils";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { CliCommander }           from "@cli/cli.commander";
import { IZapOfferResult }        from "@app/zap-ts-models/zap-offer.model";
import { BasketApiController }    from "@app/components/basket/basket-api.controller";
import { SocketServer }    from '@igniter/coldmind/socket-io.server';
import { IMessage }               from '@igniter/messaging/igniter-messages';
import { IgniterMessage }         from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/zap-message-types';
import { MessageType }            from '@igniter/messaging/message-types';
import { MessageFactory }         from '@igniter/messaging/message-factory';
import { IgniterClientSocket}     from '@igniter/coldmind/socket-io.client';
import {CachedOffersDb} from '@db/cached-offers-db';

export class SearchApiController implements IApiController {
	wss: SocketServer;
	serviceClient: IgniterClientSocket;
	searchService: PriceSearchService;
	cachedOffersDb: CachedOffersDb;

	constructor(public debugMode: boolean = false) {
		this.searchService = new PriceSearchService();
		this.serviceClient = new IgniterClientSocket();
		this.serviceClient.connect();
		this.cachedOffersDb = new CachedOffersDb();
	}

	private emitGetOffersMessage(code: string, sessId: string): void {
		let scope = this;

		let messageData = {
			code: code
		};

		this.serviceClient.sendMessage(MessageType.Action, ZapMessageType.GetOffers, messageData, sessId);
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	private onServiceMessage(mess: IMessage): void {
		let scope = this;
		mess.socket = null;
		console.log("this.serviceClient.onMessage :: data ::", mess);

		if (mess.id === ZapMessageType.GetOffersInit) {
			scope.emitGetOffersInit(mess.tag, mess.data);
			//let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
			//scope.wss.sendToSession(mess.tag, replyMess);
		}

		if (mess.id === ZapMessageType.VendorOffer) {
			scope.emitVendorOffer(mess.tag, mess.data);
			//let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
			//scope.wss.sendToSession(mess.tag, replyMess);
		}

		if (mess.id === ZapMessageType.GetOffersDone) {
			scope.emitOffersDone(mess.tag, mess.data);
			//let replyMess = new IgniterMessage(mess.type, mess.id, mess.data, mess.tag);
			//scope.wss.sendToSession(mess.tag, replyMess);
		}
	}

	/*****
	 *
	 *  Emit Messages To User Session
	 *
	 */
	private emitGetOffersInit(sessId: string, data: any): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.GetOffersInit, data, sessId);
		this.wss.sendToSession(sessId, mess);
	}

	private emitVendorOffer(sessId: string, data: any): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.VendorOffer, data, sessId);
		this.wss.sendToSession(sessId, mess);
	}

	private emitOffersDone(sessId: string, data: any): void {
		let mess = new IgniterMessage(MessageType.Action, ZapMessageType.GetOffersDone, data, sessId);
		this.wss.sendToSession(sessId, mess);
	}

	public attachWSS(wss: SocketServer): void {
		this.wss = wss;
		this.wss.onMessage(this.onUserMessage.bind(this));
	}

	private onUserMessage(mess: IMessage): void {
		let scope = this;

		let sessId =  mess.socket.request.sessionID;

		console.log("WSSERVER :: Message ::", mess.data);
		console.log("WSSERVER :: Session ID ::", sessId);

		if (mess.id === ZapMessageType.GetOffers) {
			let code = mess.data.code;
			console.log("GET OFFERS :: CODE ::", code);
			this.doGetOffers(code, sessId);
			mess.ack();
		}
	}

	public doGetOffers(code: string, sessId: string): void {
		console.log("doGetOffers :: " + code + " :: " + sessId);

		this.cachedOffersDb.getCachedOffers(code).then(res => {
			return res;
		}).catch(err => {
			console.log("doGetOffers :: Catch ::", err);
			return null;

		}).then(cachedRes => {
			console.log("Final THEN ::", cachedRes);

			if (cachedRes) {
				for (const entry of cachedRes) {

				}
			}


			this.emitGetOffersMessage(code, sessId); // Call price service


		});
	}

	public initRoutes(routes: Router): void {
		let scope = this;

		routes.get("/pt/:code", (req: Request, resp: Response) => {
			let code = req.params.code;

			console.log("Test Test ::", code);

			scope.searchService.doPriceSearch(code).then(res => {
				console.log("doPriceSearch -> resolved");
				resp.json(res);
			}).catch(err => {
				resp.json(new Error("Error looking up price!"));
			});
		});

		//
		// Get Product by Barcode
		//
		let extendedProdData = true;

		//
		// Get Zap Result by POST barcode
		//
		routes.post("/code", (req: Request, resp: Response) => {
			console.log("CODE FROM NR 1 ::", req.body.code);
			Logger.spit();
			Logger.spit();
			console.log("REQUEST BODY ::", req.body);
			Logger.spit();
			Logger.spit();

			let data = req.body;
			let reqCode = data.code;

			let fullResult = !data.cache;
			let debug = data.debug;

			console.log("Given Barcode:", data);
			//reqCode = BarcodeParser.prepEan13Code(reqCode, true);
			Logger.logGreen("Prepared Barcode:", reqCode);

			scope.callSearchService(reqCode).then((searchRes) => {
				resp.setHeader('Content-Type', 'application/json');
				resp.send(searchRes);

				//this.reqSession = req.session;
				//let addResult = this.basketController.addToBasket(reqCode, searchRes);
				//resp.send(searchRes);

				/*/resp.json(addResult);
				resp.json({test: "kalle"});
				*/

			}).catch((err) => {
				ApiControllerUtils.internalError(resp);
				Logger.logError("SearchApiController :: error ::", err);
			})
		});
	}

	public callSearchService(code: string): Promise<IZapOfferResult> {
		Logger.logGreen("callSearchService");
		let url = Settings.PriceServiceApi.Endpoint;

		return new Promise((resolve, reject) => {
			return this.searchService.doPriceSearch(code).then((searchResult) => {
				console.log("callSearchService :: doSearch ::", searchResult);

				// let result = ZapOfferResult.toZapRes(searchResult);

				resolve(null);

			}).catch((err) => {
				console.log("callSearchService :: error ::", err);
				resolve(err);
			})
		});
	}
}

if (CliCommander.debug()) {
	let app = new SearchApiController();
	//app.doDebugSearch(null, null);
}
