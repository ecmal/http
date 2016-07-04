import Node from '../node';
import {Server} from "../server";
import {Handler} from "./handler";
import {Socket} from "../ws/socket";
import {Class} from "runtime/reflect/class";
import {RestRoute} from "./rest";
import {Method} from "runtime/reflect/method";

@Server.handler('ws')
export class WebSocketHandler extends Handler {
    static get routes():{[k:string]:RestRoute}{
        return Object.defineProperty(this,'routes',{
            enumerable:true,
            value:Object.create(null)
        }).routes;
    }
    static register(path,resource:Class){
        let method = resource.getConstructor();
        let route = new RestRoute(path,method);
        let routeId = route.toString();
        if(!this.routes[routeId]){
            this.routes[routeId] = route;
        }else{
            route = this.routes[routeId];
            throw new Error(`Cant route '${method.toString()}' to '${path}' it's already bounded to ${route.method.toString()}`);
        }
    }
    constructor(){
        super();
        WebSocketHandler.server.on('upgrade',(request, socket, body)=>{
            if (Socket.isWebSocket(request)){
                this.getRoute(request, socket, body);
            }
        })
    }
    getRoute(request,socket, body){
        let url = Node.Url.parse(request.url,true);
        let method = request.method.toUpperCase();
        let headers = request.headers;
        let query = url.query;
        let route,matched,path = method+' '+url.pathname;
        for(let r in WebSocketHandler.routes){
            route = WebSocketHandler.routes[r];
            if(matched = route.match(path)){
                matched.shift();
                let options = route.toJSON();
                options.params = {};
                options.query = query;
                options.headers = headers;
                options.matched = matched;
                route.params.forEach((p,i)=>{
                    options.params[p] = matched[i];
                });
                return route.execute(options,request,socket,body,route.method.owner.metadata.ws);
            }
        }
        return null;
    }
}