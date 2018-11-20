"use strict";
/**
 * Copyright (C) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * September 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const striptags = require("striptags");
class HtmlUtilities {
    static stripTags(input) {
        return striptags(input);
    }
}
exports.HtmlUtilities = HtmlUtilities;
