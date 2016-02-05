import {Server} from "node/http";
import {EventEmitter} from "node/events";
import {IncomingMessage} from "node/http";
import {WsConnection} from "./connection";

import * as HTTP from "node/http";

export class WsServer extends EventEmitter{

    static create(server:Server,protocol:string):WsServer{
        return this.inject(HTTP.createServer(),protocol);
    }
    static inject(server:Server,protocol:string):WsServer{
        return new WsServer(server,protocol);
    }

    public protocol : string;
    public connections : number;

    constructor(server:Server,protocol:string){
        super();
        this.protocol = protocol;
        this.connections = 0;
        server.on('upgrade',(req:IncomingMessage)=>{
            this.doUpgrade(req);
        })
    }

    doUpgrade(req:IncomingMessage){
        var upgrade:string = String(req.headers['upgrade']).trim().toLowerCase();
        if(upgrade && upgrade == 'websocket') {
            var connection = new WsConnection(true);
            try{
                if(connection.accept(req,this.protocol)){
                    this.response(req.socket,101,'Switching Protocols',{
                        'Connection'                : 'Upgrade',
                        'Upgrade'                   : 'websocket',
                        'Sec-WebSocket-Accept'      : connection.hash,
                        'Sec-WebSocket-Protocol'    : this.protocol
                    });
                    req.socket.on('close',()=>{
                        this.connections--;
                        this.emit('connections', this.connections);
                    });
                    req.socket.on('error',()=>{
                        this.connections--;
                        this.emit('connections', this.connections);
                    });
                    this.connections++;
                    this.emit('connection', connection);
                    this.emit('connections', this.connections);
                }
            }catch(e){
                console.info(e.stack);
                this.response(req.socket,e.code,e.message);
            }
        }
    }

    private response(socket,status:number,message:string,headers?:any,body?){
        try {
            status = status || 500;
            message = message||'Unknown Server Error';
            var data = [`HTTP/1.1 ${status} ${message}`];
            if(headers){
                for(var key in headers){
                    if(headers[key]){
                        data.push(key+': '+headers[key]);
                    }
                }
            }
            data.push('\r\n');
            socket.write(data.join('\r\n'),'ascii');
            if(status!=101){
                socket.end()
            }
        } catch (ex){
            console.info(ex);
        }
    }


}