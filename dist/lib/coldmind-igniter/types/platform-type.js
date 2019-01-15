"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * December 2018
 */
Object.defineProperty(exports, "__esModule", { value: true });
const OS = require('os');
exports.Constants = {
    SOL_TCP: 6,
    TCP_KEEPINTVL: undefined,
    TCP_KEEPCNT: undefined
};
switch (OS.platform()) {
    case 'darwin':
        exports.Constants.TCP_KEEPINTVL = 0x101;
        exports.Constants.TCP_KEEPCNT = 0x102;
        break;
    case 'freebsd':
        exports.Constants.TCP_KEEPINTVL = 512;
        exports.Constants.TCP_KEEPCNT = 1024;
        break;
    case 'linux':
    default:
        exports.Constants.TCP_KEEPINTVL = 5;
        exports.Constants.TCP_KEEPCNT = 6;
        break;
}
