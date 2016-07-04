import 'http/handlers/files';
import 'http/handlers/rest';
import 'http/handlers/ws';

import {Server} from 'http/server';
import {Rest} from 'http/rest';
import {WebSocket} from 'http/rest';
import {Socket} from 'http/ws/socket';


@WebSocket('/agent/:id',{
    protocols : ['wcb']
})
class AgentConnections extends Socket {
    static get size():number{
        return this.connections?this.connections.size:0;
    }
    protected onOpen(){
        this.send(this);
    }
}

@Rest('/connections')
class ConnectionResource {

    private path:any;
    private query:any;
    private headers:any;
    private params:any;

    get(a,b){
        return {
            class       : this.constructor.class.name,
            params      : this.params,
            query       : this.query,
            headers     : this.headers,
            connections : AgentConnections.size
        }
    }
}

var server = new Server({
    host        : '0.0.0.0',
    port        : 3000,
    ws          : true,
    rest        : {
        path    : '/api'
    },
    files       : {
        path    : './web'
    }
}).start();


/*
server.server.on('upgrade',(request, socket, body)=>{
    if (WsServer.isWebSocket(request)){
        var ws = new WsServer(request, socket, body, ['wcb']);
        ws.on('message',(event)=>{
            ws.send(event.data);
        });
        ws.on('close',(event)=>{
            console.log('close', event.code, event.reason);
            ws = null;
        });
    }
});*/

/*
server.server.on('upgrade', function(request, socket, body) {
    // RAW METHOD
    var driver = server.server.ws = Driver.http(request);

    driver.io.write(body);
    socket.pipe(driver.io).pipe(socket);

    driver.messages.on('data', function(message) {
        console.log('Got a message', JSON.parse(message).length);
        driver.text(message);
        driver.text(message);
    });
    driver.addExtension(new PerMessageDeflate());
    driver.start();
});*/

/*
var ws:WsServer = WsServer.inject(server.server,'sip');
ws.on('connect',(connection:WsConnection)=>{
    connection.on('text',(text)=>{
        console.info("ITEMS",JSON.parse(text).length);
        connection.sendText(text);
        //console.info(text);

        //connection.sendText(JSON.stringify(data));
        //connection.sendText(data);
        //connection.sendText(data);
        //connection.sendText(data);
        //connection.sendText(data);
    });
    connection.on('binary',(binary:Buffer)=>{
        console.info(connection.id,binary);
        connection.sendBinary(binary);
        connection.sendBinary(binary);
        connection.sendBinary(binary);
    })
});*/
