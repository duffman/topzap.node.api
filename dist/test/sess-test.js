'use strict';Object.defineProperty(exports,'__esModule',{value:true});const session_igniter_entry_1=require('../app/components/session-igniter/session-igniter-entry');let sessEntry=new session_igniter_entry_1.SessionEntry('balle',{kalle:'kula'});console.log(sessEntry);console.log('');console.log(typeof sessEntry);function isSessionEntry(obj){let result=false;let objType=typeof obj;if(objType==='object'){result=obj.hasOwnProperty('id')&&obj.hasOwnProperty('data');}return result;}console.log(isSessionEntry(sessEntry));console.log(isSessionEntry({isd:'allan'}));