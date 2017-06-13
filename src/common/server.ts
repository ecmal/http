import { cached } from "@ecmal/runtime/decorators";
import { Buffer } from "@ecmal/node/buffer";
import { Socket, Server } from "@ecmal/node/net";
import { HttpRequestParser, HttpResponseParser } from "./parser";
import { HttpClient } from "./client";
import { HttpRequest } from "./request";
import { Address } from "./types";

export class HttpServer {
    @cached
    protected get socket(): Server {
        return new Server()
    }
    async listen(address: Address){
        return new Promise((accept,reject)=>{
            this.socket.listen(address);
            this.socket.once('error',(error)=>{
                reject(error)
            })
            this.socket.once('listening', () => {
                this.socket.on('connection',(socket)=>{
                    this.handle(socket);
                })
                accept(this.socket.address());
            })
        })
    }
    protected handle(socket: Socket){
        let parser: HttpRequestParser = new HttpRequestParser();
        socket.on('data', (data) => {
            parser.execute(data)
        })
        parser.on('head', async (msg) => {
            console.info(msg);
        })
        let bodies = [], length = 0;
        parser.on('body', (msg) => {
            console.info("  <-- ", msg.body.length, msg.bodySize, msg.headSize);
            bodies.push(msg.body);
            length += msg.body.length;
        })
        //http://localhost:8080/path.json
        //http://localhost:8080/grisha/path.json?alt=param
        parser.on('done', (...args) => {
            console.info("  <-- DONE ");
            let response = Buffer.from([
                `HTTP/1.1 200 OK`,
                `Date: ${new Date()}`,
                `Content-Length: ${length}`,
                `Content-Type: text/html`,
                `Connection: keep-alive`
            ].join('\r\n') + '\r\n\r\n');
            socket.write(response);
            bodies.forEach(b => {
                socket.write(b);
            })
            bodies = [];
            length = 0;
        })
    }
    protected async process(request:HttpRequest){
        console.info(request);
        return request;
    }
}