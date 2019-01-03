"use strict";
/**
 * Copyright (c) Patrik Forsberg <patrik.forsberg@coldmind.com> - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
Object.defineProperty(exports, "__esModule", { value: true });
var EventType;
(function (EventType) {
    EventType.Broadcast = "broadcast";
    let Actions;
    (function (Actions) {
        Actions.Connect = "connect";
    })(Actions = EventType.Actions || (EventType.Actions = {}));
})(EventType = exports.EventType || (exports.EventType = {}));
