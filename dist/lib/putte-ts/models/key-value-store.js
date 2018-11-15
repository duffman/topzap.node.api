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
const Collections = require("typescript-collections");
class KeyValueStore {
    constructor() {
        this.dict = new Collections.Dictionary();
    }
    add(key, value) {
        this.dict.setValue(key, value);
    }
    getAsStr(key) {
        let strValalue = "";
        let value = this.dict.getValue(key);
        if (value instanceof String) {
            strValalue = value;
        }
        return strValalue;
    }
}
exports.KeyValueStore = KeyValueStore;
