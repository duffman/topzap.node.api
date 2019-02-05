"use strict";
/*=--------------------------------------------------------------=

 PutteTSNode - Yet Another Typescript Utilities Collection

 Author : Patrik Forsberg
 Email  : patrik.forsberg@coldmind.com
 GitHub : https://github.com/duffman
 Date   : 2018-11-01

 Use this software free of charge, the only thing I ask is that
 you obey to the terms stated in the license, i would also like
 you to keep the file header intact.

 This software is subject to the LGPL v2 License, please find
 the full license attached in LICENCE.md

 =----------------------------------------------------------------= */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_commander_1 = require("@cli/cli.commander");
class PVarUtils {
    static isNothing(value) {
        return value ? true : false;
    }
    static isNullOrUndefined(value) {
        return value === null || value === undefined;
    }
    static isNumber(value) {
        return typeof value === "number";
    }
    static isValidNumber(value) {
        let result = false;
        if (value !== null) {
            let strVal = value.toString();
            let numVal = parseFloat(strVal);
            result = PVarUtils.isNumber(numVal);
        }
        return result;
    }
}
exports.PVarUtils = PVarUtils;
if (cli_commander_1.CliCommander.haveArgs()) {
    console.log("OUTSIDE CODE EXECUTING");
    console.log("Test1 ::", PVarUtils.isNumber("123"));
    console.log("Test2 ::", PVarUtils.isNumber(null));
    console.log("Test3 ::", PVarUtils.isNumber(123.34));
    console.log("Test4 ::", PVarUtils.isNumber(1));
}
