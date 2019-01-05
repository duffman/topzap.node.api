'use strict';Object.defineProperty(exports,'__esModule',{value:true});const util_1=require('util');const sql_data_column_1=require('./sql-data-column');const data_point_1=require('./data-point');class SQLTableDataRow{constructor(obj){this.isEmpty=false;this.columns=new Array();if(!util_1.isNullOrUndefined(obj)){this.parseData(obj);}}parseData(obj){for(let key in obj){if(obj.hasOwnProperty(key)){this.columns.push(new sql_data_column_1.SQLDataColumn(key,obj[key]));}}}getColumn(key){for(let i=0;i<this.columns.length;i++){let column=this.columns[i];if(column.name==key){return column;}}return null;}count(){return this.columns.length;}emptyValue(key){let column=this.getColumn(key);if(column!=null)column.value=null;}getValAsStr(key){let column=this.getColumn(key);return column!=null?column.value:null;}getValAsCVPoint(key){let column=this.getColumn(key);let res=column!=null?column.value:null;return new data_point_1.DataPoint(0,0);}getValAsNum(key){let value=this.getValAsStr(key);if(value!=null){return parseInt(value);}return-1;}getValAsInt(key){return this.getValAsNum(key);}toJson(){let data=this.columns!=null?this.columns:'NULL';return JSON.stringify(data);}}exports.SQLTableDataRow=SQLTableDataRow;