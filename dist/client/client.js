"use strict";
//import { MessageTypes } from "../../TopZap.Backend/Messaging/MessageTypes";
Object.defineProperty(exports, "__esModule", { value: true });
const message_types_1 = require("../lib/coldmind-igniter/messaging/message-types");
const message_factory_1 = require("../lib/coldmind-igniter/messaging/message-factory");
let io = require('socket.io-client');
let url = 'http://localhost:9090';
let socket = io.connect(url, { reconnect: true });
let vorpal = require('vorpal')();
let chalk = require("chalk");
class CommandHandler {
    constructor() { }
    addHandler(vorpal) {
    }
}
exports.CommandHandler = CommandHandler;
class IgniterCLIClient {
    constructor() {
        this.commands = Array();
        this.testPlayerId = 563;
        this.initialize();
        //this.commands.push(new ChestEvents());
    }
    initialize() {
        socket.on('disconnect', function (socket) {
            console.log(chalk.red('Disconnected'));
        });
        socket.on('connect', function (socket) {
            console.log(chalk.green('Connected'));
        });
        socket.on('message', function (data) {
            console.log("Message received", data);
        });
        vorpal.delimiter('viola$').show();
        this.initVorpal();
    }
    generateTag() {
        return "biCoreClient";
    }
    sendMessage(type, data, tag = "") {
        /*let dataObject = {
            "type" : type,
            "data": data,
            "tag" : tag,
        };

        let jsonData = JSON.stringify(dataObject);
        */
        data = data === null ? {} : data;
        let mess = message_factory_1.MessageFactory.newIgniterMessage(message_types_1.MessageType.Error, "id", data, tag);
        //return this.sendToSessionId(sessId, mess);
        console.log(chalk.green("OUT >>"));
        console.log(chalk.green(JSON.stringify(mess)));
        console.log(" ");
        socket.emit("message", mess);
    }
    /******************
     * SEND METHODS
     */
    buildPackage(type, data) {
    }
    sendAction(type, data = null) {
        this.sendMessage(type, data);
    }
    initGame(uuid) {
        var dataPacket = {
            "device": "iPhone6s",
            "uuid": uuid
        };
        //this.sendMessage(MessageTypes.Session.Initialize, dataPacket, "#GENERATED_TAG#");
    }
    initVorpal() {
        var scope = this;
        for (let command in this.commands) {
        }
        vorpal.command('mess [str]').action(function (args, callback) {
            let arg = args.str != null ? args.str : "";
            let dataPacket = {
                "rId": arg,
                "type": "text",
                "data": args
            };
            //	scope.sendAction(dataPacket);
            callback();
        });
        vorpal.command("init [str]").action(function (args, callback) {
            console.log('Arg:', args.str);
            let uuid = args.str != null ? args.str : "MrDuffman81";
            console.log("Using UUID:", args.str);
            scope.initGame(uuid);
            callback();
        });
        vorpal.command("session [str]").action(function (args, callback) {
            console.log('Arg:', args.str);
            scope.sendMessage(message_types_1.MessageType.Action, null);
            callback();
        });
    }
}
exports.IgniterCLIClient = IgniterCLIClient;
let client = new IgniterCLIClient();
