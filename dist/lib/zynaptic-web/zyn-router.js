'use strict';Object.defineProperty(exports,'__esModule',{value:true});class ZynRouter{constructor(app){this.app=app;this.debug();}debug(){this.app.routes('/zyn').get((req,res)=>{res.status(200).send({message:'Zynaptic Web - debug response'});});}zynGet(name,req,res,next){this.app.routes.get(name,req,res,next());}routerMiddleware(){}}