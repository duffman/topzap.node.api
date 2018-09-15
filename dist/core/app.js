"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
class App {
    constructor() {
        console.log("App started");
    }
    init() {
        app.get('/api/offer', (req, res) => {
            res.json();
        });
        app.listen(3000);
        console.log('Listening on localhost:3000');
    }
}
exports.App = App;
let app = new App();
