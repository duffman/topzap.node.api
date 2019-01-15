/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { MinerStatus }            from "@miner/miner-status";
import * as express               from "express";
import { NextFunction, Router }   from "express";
import * as bodyParser            from "body-parser";
import * as cookieParser          from "cookie-parser";
import * as session               from "express-session";
import * as cors                  from "cors";
import * as uidSafe               from "uid-safe";
import { DbManager }              from "@putteDb/database-manager";
import { Logger }                 from "@cli/cli.logger";
import { MinerApiController }     from "@api/miner-api-controller";
import { ProductDb }              from "@db/product-db";
import { IRestApiController }     from "@api/api-controller";
import { IWSApiController }       from "@api/api-controller";
import { ServiceApiController }   from "@api/rest/service-api.controller";
import { CliCommander }           from "@cli/cli.commander";
import { IZappyApp }              from "@app/zappy.app";
import { SearchWsApiController }  from "@api/ws/search-ws-api.controller";
import { ProductApiController }   from "@api/rest/product-api.controller";
import { IZynMiddleware }         from "@lib/zyn-express/zyn.middleware";
import { BasketApiController }    from "@app/api/rest/basket-api.controller";
import { DataDumpApiController }  from '@api/data-dump-api.controller';
import { SocketServer }           from '@igniter/coldmind/socket-io.server';
import { IZynMessage }               from '@igniter/messaging/igniter-messages';
import { ClientSocket }           from '@igniter/coldmind/socket-io.client';
import { DataCacheController }    from '@api/data-cache-controller';
import { BasketWsApiController }  from '@api/ws/basket-ws-api.controller';
import { ServiceWsApiController } from '@api/ws/service-ws-api.controller';
import { AnalyticsWsApiController } from '@api/ws/analytics-ws-api.controller';
import { Settings }               from '@app/zappy.app.settings';
import * as path                  from 'path';
import * as socketSession         from "socket.io-mysql-session";
import { AppDbManager }           from '@db/app-db-manager';


let mySqlStore = require("express-mysql-session")(session);

export class ZapApp implements IZappyApp {
	static developmentMode = false;

	port = 8080;
	wsPort = 8081;
	debugMode: boolean = false;

	restControllers: IRestApiController[];
	wsControllers: IWSApiController[];

	webApp: express.Application;
	webAppMiddleware: IZynMiddleware[];
	webRoutes: Router = Router();
	sessionMiddleware: any;

	wsServer: SocketServer;
	serviceClient: ClientSocket;

	db: DbManager;
	productDb: ProductDb;

	version: string = "1.6.5";

	getAppVersion(): string {
		return "ZapApp-Node-API/" + this.version;
	}

	getSecret(): string {
		return "ZapApp-Node-API/WillyW0nka";
	}

	/*
let sessionSettings = {
	secret: this.getSecret(),
	genid: (req) => {
		return "genuuid(); // use UUIDs for session IDs
	},
	//resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
};

routes.use(session(sessionSettings));
*/

	constructor(public includeMinerApi: boolean = false) {
		this.restControllers = new Array<IRestApiController>();
		this.wsControllers = new Array<IWSApiController>();

		this.webApp = express();
		this.sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }});

		cors({credentials: true, origin: true});
		this.webApp.use(cors());

		let http = require("http").Server(this.webApp);
		let sio = require("socket.io")(http);

		sio.use(new socketSession({
			db: AppDbManager.createConnection()
		}));

		this.wsServer = new SocketServer(false);
		this.wsServer.attachSocketIO(sio);


		let sessionSettings = {
			secret: "TopCap",
			cookie: { maxAge: 60000 }
		};

		let sessionMiddleware = session(sessionSettings);

		sio.use(function(socket, next) {
			sessionMiddleware(socket.request, socket.request.res, next);
		});

		this.webApp.use(sessionMiddleware);

		/*
		this.wsServer.onMessage((message: IZynMessage) => {
			console.log("WSSERVER :: Message ::", message.data);
		});
		*/

		this.webApp.use(this.webRoutes);

		/*
		this.webApp.use(cookieParser());
		this.webApp.use(bodyParser.json()); // support json encoded bodies
		this.webApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
		*/

		this.serviceClient = new ClientSocket();
		this.serviceClient.connect(null);

		this.configureWebServer2();

		this.initRestControllers();
		this.initWsControllers();

		http.listen(8080);


		/*

		this.db = new DbManager();
		this.productDb = new ProductDb();

		*/
		//this.init();
	}

	private init(): void {
		const routes = this.webRoutes;

		//this.configureWebServer();
		//this.configureWebSocket();
		//this.initRestControllers();

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
		this.webApp.use("vendor", express.static("./public/images/vendors"));
		this.webApp.use("vendors", express.static("public/images/vendors"));
		this.webApp.use("vendors", express.static("public/images/vendors/"));
		this.webApp.use("/vendorss", express.static("public/images/vendors/"));
		this.webApp.use("/vendorsss", express.static("./public/images/vendors/"));
		this.webApp.use("/vendorssss", express.static(path.join(__dirname,"./public/images/vendors/")));

		this.webApp.use('/static', express.static(path.join(__dirname, 'public')))

		this.webApp.get('/res/:filename', (req, res) => {
			let filename = req.params.code;
			console.log("Get file", filename);
		});

		//this.webApp.listen(this.port);
		//console.log(`Listening on localhost: ${this.port}`);
	}

	private initRestControllers() {
		const routes = this.webRoutes;
		const controllers = this.restControllers;

		controllers.push(new ServiceApiController(this.debugMode));
		controllers.push(new ProductApiController(this.debugMode));
		controllers.push(new MinerApiController(this.debugMode));
		controllers.push(new BasketApiController(this.debugMode));
		controllers.push(new DataDumpApiController(this.debugMode));

		//
		// Pass the Route object to each controller to assign routes
		//
		for (let index in controllers) {
			let controller = controllers[index];
			controller.initRoutes(routes);
		}
	}

	private initWsControllers() {
		const controllers = this.wsControllers;

		controllers.push(new ServiceWsApiController(this.debugMode));
		controllers.push(new SearchWsApiController(this.debugMode));
		controllers.push(new BasketWsApiController(this.debugMode));
		controllers.push(new DataCacheController(this.debugMode));
		controllers.push(new AnalyticsWsApiController(this.debugMode));

		//
		// Pass the WS Server and Service Client to each controller
		//
		for (let index in controllers) {
			let controller = controllers[index];
			controller.attachWSS(this.wsServer);
			controller.attachServiceClient(this.serviceClient);
		}
	}

	private configureWebSocket(): void {
		return;
		let wss = this.wsServer;

		wss.io.use((socket, next) => {
			this.sessionMiddleware(socket.request, socket.request.res, next);
		});

		wss.onServerStarted((port) => {
			Logger.logYellow("Websocket IOServer Started on port ::", port)
		});

		wss.onError((err) => {
			Logger.logError("Websocket Error ::", err);
		});

		wss.onMessage((mess: IZynMessage) => {
			Logger.logError("Websocket :: Message ::", mess);
		});

		wss.io.sockets.on("connection", (socket) => {
			socket.request.session; // Now it's available from Socket.IO sockets too! Win!
		});

	}

	private configureWebServer2(): void {
		// set the view engine to ejs
		this.webApp.set('view engine', 'ejs');

		this.webApp.use(express.static('public'));
		this.webApp.use("images", express.static("public/images"));

		this.webApp.use('/static', express.static(path.join(__dirname, 'public')))


/*
		this.webApp.use(cookieParser());
		this.webApp.use(bodyParser.json()); // support json encoded bodies
		this.webApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
*/

		let routes = this.webRoutes;

		routes.use(this.sessionMiddleware);

		routes.use(cookieParser());
		routes.use(bodyParser.json()); // support json encoded bodies
		routes.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

		routes.use(function (err, req, res, next) {
			res.status(err.status || 500);

			let data = {
				"error": {
					"message": "err.message",
					"error": err
				}
			};

			res.json(data);
		});
	}

	private configureWebServer(): void {
		let routes = this.webRoutes;

		// set the view engine to ejs
		this.webApp.set('view engine', 'ejs');

		function genuuid(): string {
			console.log("Generate ID::::");
			return "uidSafe(18)";
		}

		routes.use(this.sessionMiddleware);

		routes.use(cookieParser(Settings.sessionSecret));
		routes.use(bodyParser.json()); // support json encoded bodies
		routes.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

		let allowCrossDomain = (req, res, next) => {
			//let origin = req.headers['origin'] || req.headers['Origin'];
			//let or: string = origin.toString();
			//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			//res.header("Access-Control-Allow-Credentials", "true");

			res.header("Access-Control-Allow-Origin", Settings.allowedCORSOrigins);
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
			res.header("Access-Control-Allow-Headers", "Content-Type");
			res.header("Access-Control-Allow-Credentials", "true");
			next();
		};

		routes.use(allowCrossDomain);

		routes.use(function (err, req, res, next) {
			res.status(err.status || 500);
			res.render('error', {
				message: "err.message",
				error: {}
			});
		});
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
}

if (CliCommander.debug()) {
	let minerApi = true;
	let app = new ZapApp(minerApi);
}
