'use strict';Object.defineProperty(exports,'__esModule',{value:true});const session=require('express-session');let app=require('express')();let http=require('http').Server(app);let sio=require('socket.io')(http);let sessionMiddleware=session({secret:'keyboard cat',cookie:{maxAge:60000}});sio.use(function(socket,next){sessionMiddleware(socket.request,socket.request.res,next);});app.use(sessionMiddleware);app.get('/',function(req,res){req.session;});sio.on('connection',socket=>{socket.request.session;console.log('user connected');socket.on('disconnect',function(){console.log('user disconnected');});socket.on('message',message=>{console.log('Message Received: '+message);sio.emit('message',{type:'new-message',text:message});});});http.listen(8080);