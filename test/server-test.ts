import {Server} from 'http/server';
import {Rest} from 'http/rest';
import * as PATH from 'node/path';

import 'http/handlers/files';
import 'http/handlers/rest';
import {WsServer} from 'http/ws/server';
import {WsConnection} from 'http/ws/connection';

@Rest('/hello')
class HelloResource {

    private query:any;
    private headers:any;

    get(){
        return {
            resource : root,
            query    : this.query,
            headers  : this.headers
        }
    }
}
var root = PATH.resolve(__filename,'../../../web');

var server = new Server({
    host  : '0.0.0.0',
    port  : 3000,
    rest  : {
        path : '/api'
    },
    files : {
        path : root
    }
}).start();

var ws:WsServer = WsServer.inject(server.server,'sip');
ws.on('connection',(connection:WsConnection)=>{
    connection.on('text',(text)=>{
        console.info(text);
    });
    connection.on('binary',(binary:Buffer)=>{
        console.info(connection.id,binary);
        connection.sendBinary(binary);
        connection.sendBinary(binary);
        connection.sendBinary(binary);
    })
});
