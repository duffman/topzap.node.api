const Socket=require('ws');const wss=new Socket.Server({port:9090});console.log('Server Started!');wss.on('connection',function connection(ws){console.log('New Connection');ws.on('message',function incoming(message){console.log('received: %s',message);});ws.send('RESP');});