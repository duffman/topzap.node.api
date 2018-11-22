'use strict';Object.defineProperty(exports,'__esModule',{value:true});const cli_logger_1=require('../cli/cli.logger');class ServiceApiController{initRoutes(routes){let scope=this;routes.get('/service/kind:id',(req,resp)=>{cli_logger_1.Logger.logCyan('Miner Name ::',name);let kind=req.params.kind;let body=`<html><body>
					<h1>TopZap Api - Service</h1>

			</body></html>`;resp.send(body);resp.end();});}}exports.ServiceApiController=ServiceApiController;