import {Buffer} from "@ecmal/node/buffer"
import * as Url from "@ecmal/node/url"
import * as Os from "@ecmal/node/os"
import {Server,IncomingMessage,ServerResponse} from "@ecmal/node/http"
import {bound} from "@ecmal/runtime/decorators";
import {Router,Route} from "./router";


export class HttpServerRequest extends IncomingMessage {
    
}
export class HttpServerResponse extends ServerResponse {

}

export class HttpServer extends Server {
    protected base:string;
    protected router:Router<any>;
    constructor(){
        super();
        this.router = Router.default;
        this.on("request",this.onRequest);
    }
    @bound
    protected onRequest(request:HttpServerRequest,response:HttpServerResponse){
        let url = Url.parse(request.url,true);
        let path= '/'+(request.method).toUpperCase()+''+url.pathname;
        let match = this.router.match(path);
        let promise = Promise.resolve({});
        if(request.headers.host){
            url.host = request.headers.host;
        }
        if(match){
            url.params = match.params;
            promise = promise.then(r=>match.node.data(
                url,request,response
            )).then(
                r=>({status:200,message:'Success',result:r}),
                e=>({status:500,message:'Failure',result:e})
            );
        }
        promise.then(r=>{
            let message = "Not Found";
            let data = new Buffer(message)
            if(!response.headersSent){
                response.writeHead(404,message,{
                    'content-type' : "text/plain",
                    'content-length' : data.length,
                })
            }
            if(!response.finished){
                response.end(data);
            }
        })
    }
}




