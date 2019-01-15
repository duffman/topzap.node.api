/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Logger }                 from "@cli/cli.logger";
import { Settings }               from "@app/zappy.app.settings";
import { IWSApiController }       from "@api/api-controller";
import { PriceSearchService }     from "@core/price-search-engine/price.search-service";
import { CliCommander }           from "@cli/cli.commander";
import { IVendorOfferData }       from "@zapModels/zap-offer.model";
import { IZapOfferResult }        from "@zapModels/zap-offer.model";
import { SocketServer }           from '@igniter/coldmind/socket-io.server';
import { IZynMessage }               from '@igniter/messaging/igniter-messages';
import { ZynMessage }         from '@igniter/messaging/igniter-messages';
import { ZapMessageType }         from '@zapModels/messages/zap-message-types';
import { MessageType }            from '@igniter/messaging/message-types';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { CachedOffersDb }         from '@db/cached-offers-db';
import { GetOffersInit }          from '@zapModels/messages/get-offers-messages';
import {IZynSession} from '@igniter/coldmind/zyn-sio-session';

export class SearchWsApiController implements IWSApiController {
	wss: SocketServer;
	serviceClient: ClientSocket;
	cachedOffersDb: CachedOffersDb;

	constructor(public debugMode: boolean = false) {
		this.cachedOffersDb = new CachedOffersDb();
	}

	public initRoutes(routes: any): void {
	}

	/**
	 * Emit Search Message through Search Service
	 * @param {string} code
	 * @param {string} sessId
	 */
	private emitGetOffersMessage(code: string, sessId: string): void {
		let scope = this;

		let messageData = {
			code: code
		};

		this.serviceClient.sendMessage(MessageType.Action, ZapMessageType.GetOffers, messageData, sessId);
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	/*****
	 *
	 *  Emit Messages To User Session
	 *
	 */
	private emitGetOffersInit(sessId: string, data: any): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersInit, data, sessId);
		this.wss.sendToSessionId(sessId, mess);
	}

	private emitVendorOffer(sessId: string, data: any): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.VendorOffer, data, sessId);
		this.wss.sendToSessionId(sessId, mess);
	}

	private emitOffersDone(sessId: string): void {
		let mess = new ZynMessage(MessageType.Action, ZapMessageType.GetOffersDone, {}, sessId);
		this.wss.sendToSessionId(sessId, mess);
	}

	public doGetOffers(code: string, sessId: string): void {
		let scope = this;
		console.log("doGetOffers :: " + code + " :: " + sessId);

		this.cachedOffersDb.getCachedOffers(code).then(res => {
			return res;
		}).catch(err => {
			console.log("doGetOffers :: Catch ::", err);
			return null;

		}).then((cachedRes: Array<IVendorOfferData>) => {
			console.log("Final THEN ::", cachedRes);

			//
			// Simulate Messages Sent using a regular lookup
			//
			if (cachedRes) {
				scope.emitGetOffersInit(sessId, new GetOffersInit(cachedRes.length));
				for (const entry of cachedRes) {
					scope.emitVendorOffer(sessId, entry);
				}
				scope.emitOffersDone(sessId)

			//
			// Lookup offers through the price service
			//
			} else {
				scope.emitGetOffersMessage(code, sessId); // Call price service
			}
		});
	}

	public attachWSS(wss: SocketServer): void {
		this.wss = wss;
		this.wss.onMessage(this.onClientMessage.bind(this));
	}

	/**
	 * New Message from a User Session/Device
	 * @param {IZynMessage} mess
	 */
	private onClientMessage(session: IZynSession, mess: IZynMessage): void {
		let scope = this;
		let sessId =  mess.socket.request.sessionID;

		if (this.debugMode) {
			Logger.logYellow("WSSERVER :: Message ::", mess.data);
			Logger.logYellow("WSSERVER :: Session ID ::", sessId);
		}

		if (mess.id === ZapMessageType.GetOffers) {
			let code = mess.data.code;
			if (this.debugMode) Logger.logYellow("GET OFFERS :: CODE ::", code);
			this.doGetOffers(code, sessId);
			mess.ack();
		}
	}

	public attachServiceClient(client: ClientSocket): void {
		this.serviceClient = client;
		this.serviceClient.onMessage(this.onServiceMessage.bind(this));
	}

	/**
	 * New Message from Search Service
	 * @param {IZynMessage} mess
	 */
	private onServiceMessage(mess: IZynMessage): void {
		let scope = this;

		if (mess.id === ZapMessageType.GetOffersInit) {
			scope.emitGetOffersInit(mess.tag, mess.data);
		}

		if (mess.id === ZapMessageType.VendorOffer) {
			scope.emitVendorOffer(mess.tag, mess.data);
		}

		if (mess.id === ZapMessageType.GetOffersDone) {
			scope.emitOffersDone(mess.tag);
		}
	}

	/*
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


			}).catch((err) => {
				ApiControllerUtils.internalError(resp);
				Logger.logError("SearchWsApiController :: error ::", err);
			})
		});
	}
	*/

	/*
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
	*/
}

if (CliCommander.debug()) {
	let app = new SearchWsApiController();
	//app.doDebugSearch(null, null);
}
