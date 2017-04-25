import {Url,HttpHeaders} from "./common";
import {HttpServerRequest,HttpServerResponse} from "./server";
import {Buffer} from "@ecmal/node/buffer";
import {Readable} from "@ecmal/node/stream";

export class Resource {
    readonly url       : Url;
    readonly request   : HttpServerRequest;
    readonly response  : HttpServerResponse;

    redirect(location:string,status:number=302,headers={}){
        this.response.writeHead(
            status,
            Object.assign(headers,{location})
        );
        this.response.end();
        return true;
    }

    async read():Promise<Buffer>{
        return new Promise<Buffer>((accept,reject)=>{
            try{
                let data = new Buffer(0);
                this.request.on('data',chunk=>{
                    try{
                        data = Buffer.concat([data,chunk],data.length+chunk.length);
                    }catch(ex){
                        reject(ex);
                    }
                });
                this.request.on('end',()=>accept(data));
                this.request.on('error',e=>reject(e));
            }catch(ex){
                reject(ex);
            }
        })            
    }
    async write(body:Buffer|string,code:number=200,headers:HttpHeaders={}){
        let data = body;
        let type = 'application/octet-stream';
        
        if(!Buffer.isBuffer(body)){
            type = 'text/plain';
            data = new Buffer(String(body),'utf8');
        }
        
        headers = Object.keys(headers).reduce((h,k)=>(
            h[String(k).toLowerCase()] = headers[k], h
        ),{ "content-type" : type });
        
        headers["content-length"] = data.length;

        this.response.writeHead(code, headers);
        this.response.end(data);
        return true;
    }

    async writeStream(stream:Readable,code:number=200,headers:HttpHeaders={}){
        let type = 'application/octet-stream';
        headers = Object.keys(headers).reduce((h,k)=>(
            h[String(k).toLowerCase()] = headers[k], h
        ),{ "content-type" : type });
        this.response.writeHead(code, headers);
        return new Promise((accept,reject)=>{
            let writeStream = stream.pipe(this.response);
            writeStream.once('finish',()=>accept(true));
            writeStream.once('error',(e)=>accept(false));
        });
    }
}