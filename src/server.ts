import {Buffer} from "@ecmal/node/buffer"
import * as Url from "@ecmal/node/url"
import {Server,IncomingMessage,ServerResponse} from "@ecmal/node/http"
import {Bound} from "@ecmal/runtime/decorators";
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
        this.base = "http://localhost";
        this.on("request",this.onRequest);
    }
    @Bound
    protected onRequest(request:HttpServerRequest,response:HttpServerResponse){
        let uri = Url.resolve(this.base,request.url);
        let url = Url.parse(uri);
        let path= '/'+(request.method).toUpperCase()+''+url.pathname;
        let match = this.router.match(path);
        let promise = Promise.resolve({});
        if(match){
            let params = match.params;
            promise = promise.then(r=>match.node.data(
                url,
                params,
                request,
                response
            )).then(
                r=>({status:200,message:'Success',result:r}),
                e=>({status:500,message:'Failure',result:e})
            );
        }
        promise.then(r=>{
            if( !match ){
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
            }
        })        
    }
}




