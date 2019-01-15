"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
const maxInt = Math.pow(2, 31) - 1;
class IdGenerator {
    static newId() {
        return new Date().getMilliseconds();
    }
}
exports.IdGenerator = IdGenerator;
