import * as Url from "@ecmal/node/url"
import * as Os from "@ecmal/node/os"
import { Buffer } from "@ecmal/node/buffer"
import { Server } from "@ecmal/node/http"
import { bound, cached } from "@ecmal/runtime/decorators";
import { Router, Route, Match } from "../router";
import { HttpJsonConsumer } from "./consumers/json";
import { HttpServerRequest } from "./request";
import { HttpServerResponse } from "./response";
import { HttpProducer } from "./producers/producer";
import { HttpJsonProcuder } from "./producers/json";
import { HttpConsumer } from "./consumers/consumer";
import { HttpServerContext } from "./context";
import { Resource } from "../resource";

export class HttpRoute extends Route {
    static router = new Router<HttpRoute>(HttpRoute);
    static match(path:string):Match<HttpRoute>{
        return this.router.match(path);
    }
    static define(path:string){
        return this.router.define(path);
    }
    public addResource(method:string,controller:{new():Resource},action:string){
        console.info(method,this.pattern,controller.name,action)
    }
}


export class HttpServer extends Server {
    readonly base: string;
    constructor(){
        super();
        this.on("request", async (request, response: HttpServerResponse) => {
            try{
                await this.process(request, response);
            }catch(ex){
                console.error(ex);
                response.writeHead(500,ex.message,{
                    'content-type':'text/plain'
                });
                response.end(ex.stack || ex.message);
            }
        });
    }
    protected getUrl(request: HttpServerRequest) {
        let path = request.url.replace(/\/+/g, '/');
        let head = request.headers;
        let url = Url.parse(path, true);
        url.protocol = `${head['x-forwarded-proto'] || 'http'}:`;
        url.host = `${head.host || head['x-forwarded-for'] || this.address().address}`;
        url = Url.parse(Url.format(url), true)
        request.url = url.href;
        return url;
    }
    protected getProducer(request: HttpServerRequest, response: HttpServerResponse, resource: any): HttpProducer {
        return new HttpJsonProcuder(request, response, resource);
    }
    protected getConsumer(request: HttpServerRequest, response: HttpServerResponse, resource: any): HttpConsumer {
        return new HttpJsonConsumer(request, response, resource);
    }
    protected getContext(method: string, url: Url.Url, request: HttpServerRequest, response: HttpServerResponse):HttpServerContext{
        return new HttpServerContext(method, url, request, response)
    }
    protected async process(request: HttpServerRequest, response: HttpServerResponse) {
        let method = request.method = request.method.toUpperCase();
        let url = this.getUrl(request);
        let context = this.getContext(method, url, request, response);
        context.onStart();
        let route = await this.route(context);
        if (route) {
            context.onRoute(route);
        }
        let producer = this.getProducer(request, response, route);
        let consumer = this.getConsumer(request, response, route);
        let result = null;
        try {
            if (route) {
                let resource = route[method];
                if (resource){
                    let body = await consumer.consume()
                    context.onConsume(body);
                    result = await resource.action(
                        url, body.body, request, response,
                        (resource, action, args, mirror) => {
                            context.onResource(resource, action, args, mirror)
                        }
                    );
                } else {
                    throw new Error(`Method "${method}" not implemented for "${url.pathname}"`)
                }
            }
            result = (await context.execute(result)) || result;
        } catch (ex) {
            result = ex;
        }
        
        context.onExecute(result)
        context.onProduce(await producer.produce(result));
        context.onEnd();
    }
    protected async route(context: HttpServerContext){
        let match = HttpRoute.match(context.url.pathname);
        if (match) {
            context.url.params = match.params;
        }
        return match && match.node && match.node.data;
    }
}