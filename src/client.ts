
import {Buffer} from "@ecmal/node/buffer";
import * as Path from "@ecmal/node/path";
import {Agent as HttpsAgent} from "@ecmal/node/https";
import {Agent as HttpAgent} from "@ecmal/node/http";
import {ClientRequestEvents} from "@ecmal/node/http";
import {ClientRequest} from "@ecmal/node/http";

import {IncomingMessage} from "@ecmal/node/http";
import {RequestOptions} from "@ecmal/node/http";
import {Socket} from "@ecmal/node/net";
import {EventEmitter,EmitterEvents} from "@ecmal/node/events";
import {Cached} from "@ecmal/runtime/decorators";

export interface HttpHeaders {
    [key: string]: any;
}
export interface HttpQuery {
    [key: string]: any;
}
export type HttpMethod = "GET" | "POST" | "DELETE" | "PUT";

export interface HttpRequestOptions extends RequestOptions {}

export class HttpResponse extends IncomingMessage {
    init(){}
    inspect(){
        return {
            status : this.statusCode,
            messge : this.statusMessage
        }
    }
    raw():Promise<Buffer>{
        return new Promise((accept,reject)=>{
            let body = new Buffer(0);
            this.on('error',e=>reject(e));
            this.on("data", (chunk: Buffer) => {
                body = Buffer.concat([body, chunk], body.length + chunk.length);
            })
            this.on("end", () => {
                accept(body)
            })
        })
    }
    async text():Promise<string>{
        return (await this.raw()).toString("utf8")
    }
    async json():Promise<any>{
        return JSON.parse(await this.text());
    }
}

export class HttpRequest<T extends HttpResponse> extends ClientRequest {
    public method:string;
    public path:string;
    public responseType:Constructor<T>;
    public setMethod(method:string){
        this.method = method;
    }
    public setPath(path:string){
        this.path = path;
    }
    public getResponse(){
        return this['res'];
    }
    public getStatus(){
        if(this.getResponse()){
            return this.getResponse().statusCode;
        }
    }
    public getMessage(){
        if(this.getResponse()){
            return this.getResponse().statusMessage;
        }
    }
    public getRequestHeaders(){
        if(this['_headers']){
            let headers:any = {}
            Object.keys(this['_headers']).forEach(h=>{
                headers[h] = this.getHeader(h);
            })
            return headers;
        }
    }
    public getResponseHeaders(){
        if(this.getResponse()){
            return this.getResponse().headers;
        }
    }
    constructor(options:HttpRequestOptions,responseType?:Constructor<T>,api?:HttpClient){
        options.agent = api;
        super(options);
        this.responseType = responseType;
        this.once("response",(response)=>{
            Object.setPrototypeOf(response,responseType?responseType.prototype:HttpResponse.prototype);
            response.init();            
        });
    }
    send(body?:Buffer):Promise<T>{
        return new Promise((accept, reject) => {
            this.once("error", reject);
            this.once("response", (response:T) => {
                accept(response);
            })
            if(body){
                this.setHeader('content-length',String(body.length));
                this.write(body);
            }
            this.end();
        });
    }
    inspect() {
        return { 
            method      : this.method,
            path        : this.path,
            status      : this.getStatus(),
            message     : this.getMessage(),
            request     : {
                headers : this.getRequestHeaders()
            },
            response    : this.getResponse()
        };
    }
}

export class HttpClient extends HttpAgent {
    @Cached
    static get default(){
        return new this();
    }
    static request<T extends HttpResponse = HttpResponse>(options:RequestOptions,responseType?:Constructor<T>,client?:HttpsClient):HttpRequest<T>{
        return new HttpRequest<T>(options,responseType,client?client:HttpClient.default);
    }
}

export class HttpsClient extends HttpsAgent {
    @Cached
    static get default(){
        return new HttpsClient();
    }
    static request<T extends HttpResponse = HttpResponse>(options:RequestOptions,responseType?:Constructor<T>,client?:HttpsClient):HttpRequest<T>{
        return new HttpRequest<T>(options,responseType,client?client:HttpsClient.default);
    }
}




