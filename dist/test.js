"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miner_status_1 = require("@miner/miner-status");
const express = require('express');
const app = express();
//app.get('/', (req, res) => res.send('Hello World!'))
//error
/*

var model = {
    product: "Kalle",
    barcode: "349573498579",
    cover_url: "https://uk.webuy.com/product_images/Gaming/Playstation4%20Software/711719417576_l.jpg"
}

app.get('/api/offer', (req, res)=>{
            res.json(model);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))


*/
let stat = new miner_status_1.MinerStatus();
let info = stat.getProgressInfo();
