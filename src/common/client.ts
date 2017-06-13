import { Buffer } from "@ecmal/node/buffer";
import { Socket, SocketOptions } from "@ecmal/node/net";
import { HttpResponseParser } from "./parser";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";
import { Address } from "./types";
import { cached } from "@ecmal/runtime/decorators";
export class HttpClient {
    @cached
    protected get socket(): Socket {
        return new Socket()
    }
   
    async connect(address:Address){
        return new Promise((accept,reject)=>{
            this.socket.once('connect', () => {
                accept()
            })
            this.socket.once('error', (error) => {
                reject(error)
            })
            this.socket.connect(address.port,address.host);
        })
    }
    async execute(request: HttpRequest):Promise<HttpResponse>{
        let parser = new HttpResponseParser();
        this.socket.on('data', (data) => {
            parser.execute(data)
        })
        return new Promise((accept, reject) => {
            parser.once('head', (msg) => {
                accept(msg);
            })
            parser.once('body', (msg) => {
                console.info("BODY", msg)
            })
            parser.once('done', (msg) => {
                console.info("DONE")
            })
            this.socket.write(request.getHead());
            this.socket.write(request.getBody());
        })
    }
}