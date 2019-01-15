"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const LowPortNum = 3000;
const HighPortNum = 10000;
class RandomPortGenerator {
    static get(rangeStart = -1, rangeEnd = -1) {
        if (rangeStart < 1) {
            rangeStart = LowPortNum;
        }
        if (rangeEnd < 1) {
            rangeEnd = HighPortNum;
        }
        if (rangeEnd < rangeStart) {
            rangeEnd = rangeStart = +LowPortNum;
        }
        return Math.floor(Math.random() * rangeEnd) + rangeStart;
    }
}
exports.RandomPortGenerator = RandomPortGenerator;
