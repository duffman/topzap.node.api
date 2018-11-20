"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DUpdate {
    constructor(table) {
        this.table = table;
    }
}
exports.DUpdate = DUpdate;
class DInsert {
    constructor(data, tableName) {
        this.data = data;
        this.tableName = tableName;
        this.mySQLReplace = false;
    }
}
exports.DInsert = DInsert;
class DWith {
    constructor(...data) {
        this.data = data;
    }
}
exports.DWith = DWith;
class DInto {
    constructor(tableName) {
        this.tableName = tableName;
    }
}
exports.DInto = DInto;
class DSelect {
    constructor(column, alias = null) {
        this.column = column;
        this.haveAlias = alias != null;
    }
}
exports.DSelect = DSelect;
class DSelectAll {
    constructor(column, alias = null) {
        this.column = column;
        this.haveAlias = alias != null;
    }
}
exports.DSelectAll = DSelectAll;
class DSet {
    constructor(column, value, escape = true) {
        this.column = column;
        this.value = value;
        this.escape = escape;
    }
}
exports.DSet = DSet;
class DLeftJoin {
    constructor(table, on) {
        this.table = table;
        this.on = on;
    }
}
exports.DLeftJoin = DLeftJoin;
class DFrom {
    constructor(table, alias = null) {
        this.table = table;
        this.alias = alias;
    }
}
exports.DFrom = DFrom;
class DAnd {
    constructor(col, equals = null) {
        this.col = col;
        this.equals = equals;
    }
}
exports.DAnd = DAnd;
class DWhere {
    constructor(that, equals = null) {
        this.that = that;
        this.equals = equals;
    }
}
exports.DWhere = DWhere;
class DWhereExt {
    constructor(type, that, value1, value2 = null) {
        this.type = type;
        this.that = that;
        this.value1 = value1;
        this.value2 = value2;
    }
}
exports.DWhereExt = DWhereExt;
class DOrderBy {
    constructor(col) {
        this.col = col;
    }
    ;
}
exports.DOrderBy = DOrderBy;
class DLimit {
    constructor(fromValue, toValue = null) {
        this.fromValue = fromValue;
        this.toValue = toValue;
    }
    ;
}
exports.DLimit = DLimit;
