/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { MinerStatus }            from "@miner/miner-status";
import * as express               from "express";
import { Router }                 from "express";
import * as bodyParser            from "body-parser";
import * as cookieParser          from "cookie-parser";
import { DbManager }              from "@putteDb/database-manager";
import { SearchResult }           from "@models/search-result";
import { Logger }                 from "@cli/cli.logger";
import { MinerApiController }     from "@api/miner-api-controller";
import { ProductDb }              from "@db/product-db";
import { IApiController }         from "@api/api-controller";
import { ServiceApiController }   from "@api/service-api-controller";
import { CliCommander }           from "@cli/cli.commander";
import { IZappyApp }              from "@app/zappy.app";
import {SearchApiController} from "@api/search-api-controller";

export class ZapApp implements IZappyApp {
	port = 8080;
	apiControllers: IApiController[];
	webServer: express.Application;
	webRoutes: Router = Router();

	db: DbManager;
	productDb: ProductDb;

	getVersion(): string {
		return "ZapApp-Node-API/1.6.5";
	}

	constructor(public includeMinerApi: boolean = false) {
		this.apiControllers = new Array<IApiController>();
		this.webServer = express();
		this.db = new DbManager();
		this.productDb = new ProductDb();
		this.init();
	}

	//
	// This is really bad design, but until we have DI, this OK for now,,,
	//

	public test(barcode: string): Promise<SearchResult> {
		return new Promise<SearchResult>((resolve, reject) => {
			this.productDb.getProductOffers(barcode, false,false).then((result) => {
				resolve(result)
			}).catch((error) => {
				Logger.logError("Error in test", error);
			});
		});
	}

	/**
	 * Create child controllers and let each controlller
	 * add itself to the main Router
	 */
	private initControllers() {
		const routes = this.webRoutes;
		const controllers = this.apiControllers;

		controllers.push(new SearchApiController());
		controllers.push(new ServiceApiController());
		controllers.push(new MinerApiController());

		//
		// Pass the Route object to each controller to assign routes
		//
		for (let index in controllers) {
			let controller = controllers[index];
			controller.initRoutes(routes);
		}
	}

	private configureWebServer(): void {
		let app = this.webServer;

		// set the view engine to ejs
		app.set('view engine', 'ejs');

		app.use(cookieParser());
		app.use(bodyParser.json()); // support json encoded bodies
		app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			next();
		});
	}

	/**
	 * Initialize The Express Web Server
	 */
	private init(): void {
		let app = this.webServer;

		this.configureWebServer();
		this.initControllers();

		app.get('/minerstats', function(req, res) {
			let stat = new MinerStatus();
			stat.getProgressInfo().then((data) => {
				console.log(data);
				res.render('pages/minerstats', {progData: data});
			});
		});

		// TODO: MOVE TO NGINX
		// Get Static file
		//
		app.use(express.static('public'));

		app.get('/res/:filename', (req, res) => {
			let filename = req.params.code;
			console.log("Get file", filename);
		});

		app.listen(this.port);
		console.log(`Listening on localhost: ${this.port}`);
	}
}

if (CliCommander.debug()) {
	let minerApi = true;
	let app = new ZapApp(minerApi);
}
