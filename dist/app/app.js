"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const miner_status_1 = require("@miner/miner-status");
const express = require("express");
const express_1 = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const cli_logger_1 = require("@cli/cli.logger");
const miner_api_controller_1 = require("@api/miner-api-controller");
const service_api_controller_1 = require("@api/rest/service-api.controller");
const cli_commander_1 = require("@cli/cli.commander");
const search_ws_api_controller_1 = require("@api/ws/search-ws-api.controller");
const product_api_controller_1 = require("@api/rest/product-api.controller");
const basket_api_controller_1 = require("@app/api/rest/basket-api.controller");
const data_dump_api_controller_1 = require("@api/data-dump-api.controller");
const socket_io_server_1 = require("@igniter/coldmind/socket-io.server");
const socket_io_client_1 = require("@igniter/coldmind/socket-io.client");
const data_cache_controller_1 = require("@api/data-cache-controller");
const basket_ws_api_controller_1 = require("@api/ws/basket-ws-api.controller");
const service_ws_api_controller_1 = require("@api/ws/service-ws-api.controller");
class ZapApp {
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
    constructor(includeMinerApi = false) {
        this.includeMinerApi = includeMinerApi;
        this.port = 8080;
        this.wsPort = 8081;
        this.debugMode = false;
        this.webRoutes = express_1.Router();
        this.version = "1.6.5";
        this.restControllers = new Array();
        this.wsControllers = new Array();
        this.webApp = express();
        this.sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } });
        cors({ credentials: true, origin: true });
        this.webApp.use(cors());
        let http = require('http').Server(this.webApp);
        let sio = require('socket.io')(http);
        this.wsServer = new socket_io_server_1.SocketServer(false);
        this.wsServer.attachSocketIO(sio);
        let sessionMiddleware = session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } });
        sio.use(function (socket, next) {
            sessionMiddleware(socket.request, socket.request.res, next);
        });
        this.webApp.use(sessionMiddleware);
        this.wsServer.onMessage((message) => {
            console.log("WSSERVER :: Message ::", message.data);
        });
        this.webApp.use(this.webRoutes);
        this.webApp.use(cookieParser());
        this.webApp.use(bodyParser.json()); // support json encoded bodies
        this.webApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        this.serviceClient = new socket_io_client_1.ClientSocket();
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
    getAppVersion() {
        return "ZapApp-Node-API/" + this.version;
    }
    getSecret() {
        return "ZapApp-Node-API/WillyW0nka";
    }
    init() {
        const routes = this.webRoutes;
        //this.configureWebServer();
        //this.configureWebSocket();
        //this.initRestControllers();
        routes.get("/test", function (req, res) {
            console.log("TypeOf Session ::", typeof req.session);
            if (req.session.basket) {
                req.session.basket.itemCount++;
                res.setHeader('Content-Type', 'text/html');
                res.write('<p>views: ' + req.session.basket.itemCount + '</p>');
                res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
                res.end();
            }
            else {
                req.session.basket = {
                    type: "basket",
                    itemCount: 0
                };
                res.end('welcome to the session demo. refresh! :: ' + req.session.basket.itemCount);
            }
        });
        routes.get('/minerstats', (req, res) => {
            let stat = new miner_status_1.MinerStatus();
            stat.getProgressInfo().then((data) => {
                console.log(data);
                res.render('pages/minerstats', { progData: data });
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
        //this.webApp.listen(this.port);
        //console.log(`Listening on localhost: ${this.port}`);
    }
    initRestControllers() {
        const routes = this.webRoutes;
        const controllers = this.restControllers;
        controllers.push(new service_api_controller_1.ServiceApiController(this.debugMode));
        controllers.push(new product_api_controller_1.ProductApiController(this.debugMode));
        controllers.push(new miner_api_controller_1.MinerApiController(this.debugMode));
        controllers.push(new basket_api_controller_1.BasketApiController(this.debugMode));
        controllers.push(new data_dump_api_controller_1.DataDumpApiController(this.debugMode));
        //
        // Pass the Route object to each controller to assign routes
        //
        for (let index in controllers) {
            let controller = controllers[index];
            controller.initRoutes(routes);
        }
    }
    initWsControllers() {
        const controllers = this.wsControllers;
        controllers.push(new service_ws_api_controller_1.ServiceWsApiController(this.debugMode));
        controllers.push(new search_ws_api_controller_1.SearchWsApiController(this.debugMode));
        controllers.push(new basket_ws_api_controller_1.BasketWsApiController(this.debugMode));
        controllers.push(new data_cache_controller_1.DataCacheController(this.debugMode));
        //
        // Pass the WS Server and Service Client to each controller
        //
        for (let index in controllers) {
            let controller = controllers[index];
            controller.attachWSS(this.wsServer);
            controller.attachServiceClient(this.serviceClient);
        }
    }
    configureWebSocket() {
        return;
        let wss = this.wsServer;
        wss.io.use((socket, next) => {
            this.sessionMiddleware(socket.request, socket.request.res, next);
        });
        wss.onServerStarted((port) => {
            cli_logger_1.Logger.logYellow("Websocket IOServer Started on port ::", port);
        });
        wss.onError((err) => {
            cli_logger_1.Logger.logError("Websocket Error ::", err);
        });
        wss.onMessage((mess) => {
            cli_logger_1.Logger.logError("Websocket :: Message ::", mess);
        });
        wss.io.sockets.on("connection", (socket) => {
            socket.request.session; // Now it's available from Socket.IO sockets too! Win!
        });
    }
    configureWebServer2() {
        // set the view engine to ejs
        this.webApp.set('view engine', 'ejs');
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
    configureWebServer() {
        let routes = this.webRoutes;
        // set the view engine to ejs
        this.webApp.set('view engine', 'ejs');
        function genuuid() {
            console.log("Generate ID::::");
            return "uidSafe(18)";
        }
        routes.use(this.sessionMiddleware);
        routes.use(cookieParser());
        routes.use(bodyParser.json()); // support json encoded bodies
        routes.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        routes.use(function (req, res, next) {
            let origin = req.headers['origin'] || req.headers['Origin'];
            let or = origin.toString();
            /*
            console.log("ORIGIN ::", or);
            res.header('Access-Control-Allow-Origin', or);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");
            */
            /*
            res.header('Access-Control-Allow-Origin', origin[0]);
            //res.header("Access-Control-Allow-Origin", "http://localhost:4200");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");
            */
            next();
        });
        routes.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: "err.message",
                error: {}
            });
        });
    }
    setErrorMiddleware() {
        //
        // Error middleware
        //
        if (ZapApp.developmentMode) {
            this.webApp.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }
        else {
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
ZapApp.developmentMode = false;
exports.ZapApp = ZapApp;
if (cli_commander_1.CliCommander.debug()) {
    let minerApi = true;
    let app = new ZapApp(minerApi);
}
