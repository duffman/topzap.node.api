'use strict';Object.defineProperty(exports,'__esModule',{value:true});const zap_error_result_1=require('./zap-error-result');const zap_error_result_2=require('./zap-error-result');class Test{constructor(){let data='{"code": 6667, "message": "error-getting-item"}';let errData=zap_error_result_1.GetZapError(data);console.log('ErrData',errData);}tryData(data){let errData=zap_error_result_1.GetZapError(data);console.log('ErrData :: raw',errData);console.log('ErrData :: isErr',errData!==null);return errData instanceof zap_error_result_2.ZapErrorResult;}}exports.Test=Test;