#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args = process.argv.slice(2);
class CliCommander {
    static haveArgs() {
        return args.length > 0;
    }
    static first() {
        return args.length > 0 ? args[0] : null;
    }
    static debug() {
        return this.first() === "debug";
    }
    static parseCliArgs(args) {
    }
}
exports.CliCommander = CliCommander;
CliCommander.parseCliArgs(args);
