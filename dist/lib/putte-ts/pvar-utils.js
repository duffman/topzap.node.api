'use strict';Object.defineProperty(exports,'__esModule',{value:true});const cli_commander_1=require('../../app/cli/cli.commander');class PVarUtils{static isNothing(value){return value?true:false;}static isNullOrUndefined(value){return value===null||value===undefined;}static isNumber(value){return typeof value==='number';}static isValidNumber(value){let result=false;if(value!==null){let strVal=value.toString();let numVal=parseFloat(strVal);result=PVarUtils.isNumber(numVal);}return result;}}exports.PVarUtils=PVarUtils;if(cli_commander_1.CliCommander.haveArgs()){console.log('Test1 ::',PVarUtils.isNumber('123'));console.log('Test2 ::',PVarUtils.isNumber(null));console.log('Test3 ::',PVarUtils.isNumber(123.34));console.log('Test4 ::',PVarUtils.isNumber(1));}