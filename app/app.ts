/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { MinerStatus }            from "@miner/miner-status";
import * as express               from "express";
import { NextFunction, Router }   from "express";
import { ErrorRequestHandler }    from "express";
import * as bodyParser            from "body-parser";
import * as cookieParser          from "cookie-parser";
import * as session               from "express-session";
import * as uidSafe               from "uid-safe";
import { DbManager }              from "@putteDb/database-manager";
import { SearchResult }           from "@models/search-result";
import { Logger }                 from "@cli/cli.logger";
import { MinerApiController }     from "@api/miner-api-controller";
import { ProductDb }              from "@db/product-db";
import { IApiController }         from "@api/api-controller";
import { ServiceApiController }   from "@api/service-api.controller";
import { CliCommander }           from "@cli/cli.commander";
import { IZappyApp }              from "@app/zappy.app";
import { SearchApiController }    from "@api/search-api.controller";
import { ProductApiController }   from "@api/product-api.controller";
import { IZynMiddleware }         from "@zynIgniter/zyn.middleware";
import { ZynSession }             from "@zynIgniter/zyn.session";
import { BasketApiController } from "@app/components/basket/basket-api.controller";

export class ZapApp implements IZappyApp {
	static developmentMode = false;

	port = 8080;
	debugMode: boolean = false;

	apiControllers: IApiController[];
	webApp: express.Application;
	webAppMiddleware: IZynMiddleware[];
	webRoutes: Router = Router();

	db: DbManager;
	productDb: ProductDb;

	version: string = "1.6.5";
	getAppVersion(): string {
		return "ZapApp-Node-API/" + this.version;
	}

	getSecret(): string {
		return "ZapApp-Node-API/WillyW0nka";
	}

	constructor(public includeMinerApi: boolean = false) {
		this.apiControllers = new Array<IApiController>();
		this.webApp = express();
		this.webApp.use(this.webRoutes);

		//this.webAppMiddleware = new Array<IZynMiddleware>();
		//this.registerMiddleware();

		this.db = new DbManager();
		this.productDb = new ProductDb();

		console.log(" ");
		console.log(" ");

		console.log(">> webApp.routes", this.webApp.routes);
		console.log(">> TYPE :: webApp.routes", typeof this.webApp.routes);

		console.log(" ");

		console.log(">> webRoutes", this.webRoutes);
		console.log(">> TYPE :: webRoutes.routes", typeof this.webRoutes);
		console.log(" ");
		console.log(" ");


		this.init();
	}

	// Move to ZynApp
	public registerMiddleware() {
		const middleware = this.webAppMiddleware;
		const routes = this.webRoutes;

		middleware.push(new ZynSession());

		for (let index in middleware) {
			let zynMiddleware = middleware[index];
			zynMiddleware.initRoutes(routes);
		}
	}


	/**
	 * Create child controllers and let each controlller
	 * add itself to the main Router
	 */
	private initControllers() {
		const routes = this.webRoutes;
		const controllers = this.apiControllers;

		controllers.push(new SearchApiController(this.debugMode));
		controllers.push(new ServiceApiController(this.debugMode));
		controllers.push(new ProductApiController(this.debugMode));
		controllers.push(new MinerApiController(this.debugMode));
		controllers.push(new BasketApiController(this.debugMode));

		//
		// Pass the Route object to each controller to assign routes
		//
		for (let index in controllers) {
			let controller = controllers[index];
			controller.initRoutes(routes);
		}
	}

	private configureWebServer(): void {
		let routes = this.webRoutes;

		// set the view engine to ejs
		this.webApp.set('view engine', 'ejs');

		function genuuid(): string {
			console.log("Generate ID::::");
			return "uidSafe(18)";
		}

		let sessionSettings = {
			secret: this.getSecret(),
			genid: (req) => {
				return genuuid(); // use UUIDs for session IDs
			},
 			//resave: false,
			saveUninitialized: true,
			cookie: { secure: false }
		};

		//routes.use(session(sessionSettings));

		routes.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));

		routes.use(cookieParser());
		routes.use(bodyParser.json()); // support json encoded bodies
		routes.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


		routes.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		});

		routes.use(function (err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: "err.message",
				error: {}
			});
		});

		//this.setErrorMiddleware();
	}

	private setErrorMiddleware(){
		//
		// Error middleware
		//
		if (ZapApp.developmentMode) {
			this.webApp.use(function(err, req, res, next) {
				res.status(err.status || 500);
				res.render('error', {
					message: err.message,
					error: err
				});
			});

		} else {
			// production error handler
			// no stacktraces leaked to user

			this.webApp.use(function (err, req, res, next) {
				res.status(err.status || 500);
				res.render('error', {
					message: err.message,
					error: {}
				});
			});
		}
	}

	/**
	 * Initialize The Express Web Server
	 */
	private init(): void {
		const routes = this.webRoutes;

		this.configureWebServer();


		this.initControllers();

		routes.get("/test", function(req, res) {
			console.log("TypeOf Session ::", typeof req.session);


			if (req.session.basket) {
				req.session.basket.itemCount++
				res.setHeader('Content-Type', 'text/html')
				res.write('<p>views: ' + req.session.basket.itemCount + '</p>')
				res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
				res.end()
			} else {
				req.session.basket = {
					type: "basket",
					itemCount: 0
				};
				res.end('welcome to the session demo. refresh! :: ' + req.session.basket.itemCount);
			}
		});

		routes.get('/minerstats', (req, res) => {
			let stat = new MinerStatus();
			stat.getProgressInfo().then((data) => {
				console.log(data);
				res.render('pages/minerstats', {progData: data});
			});
		});

		// TODO: MOVE TO NGINX
		// Get Static file
		//
		this.webApp.use(express.static('public'));

		this.webApp.get('/res/:filename', (req, res) => {
			let filename = req.params.code;
			console.log("Get file", filename);
		});

		this.webApp.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}
}

if (CliCommander.debug()) {
	let minerApi = true;
	let app = new ZapApp(minerApi);
}
