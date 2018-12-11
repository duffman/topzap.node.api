/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { Request }                from "express";
import { Response }               from "express";
import { NextFunction }           from "express";
import { Router }                 from "express";
import {ISessionBasket, SessionBasket} from '@zapModels/basket-collection';
import {Logger} from '@cli/cli.logger';

export interface ISessionManager {
	debugMode: boolean;
	reqSession: any;
	httpRequest: Request;

	sessionBasket: ISessionBasket;

	getSessionBasket(): ISessionBasket;
	setSessionBasket(basket: ISessionBasket): boolean;

}

export class SessionManager implements ISessionManager {
	httpRequest: Request;
	debugMode: boolean;
	reqSession: any;

	sessionBasket: ISessionBasket;

	public assignRequest(httpRequest: Request) {
		this.httpRequest = httpRequest;
		this.reqSession = httpRequest.session;
	}

	public getSessionBasket(): ISessionBasket {
		try {
			if (this.reqSession.sessionBasket) {
				this.sessionBasket = this.reqSession.sessionBasket as ISessionBasket;
				Logger.logOut("Session Basket ::", this.sessionBasket);

			} else {
				this.reqSession.sessionBasket = new SessionBasket();
				this.sessionBasket = this.reqSession.sessionBasket;
			}

			return this.sessionBasket;

		} catch (ex) {
			return null;
		}
	}

	public setSessionBasket(basket: ISessionBasket = null): boolean {
		try {
			if (basket === null) {
				basket = this.sessionBasket;
			}

			this.reqSession.sessionBasket = basket; //this.sessionBasket;

		} catch (err) {
			console.log("setSessionBasket :: err ::", err);
			return false;
		}

		return true;
	}

}