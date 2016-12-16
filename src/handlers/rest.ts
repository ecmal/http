import Node from '../node';
import {Server} from '../server';
import {Mime} from '../mime';
import {Handler} from './handler';
import {Result} from '../rest';
import {Class} from "runtime/reflect/class";
import {Method} from "runtime/reflect/method";
import {Member} from "runtime/reflect/member";
import {Constructor} from "runtime/reflect/constructor";

export class RestRoute {
    static ACTIONS = ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'];
    static isActionMethod(m:Member){
        return (m instanceof Method && RestRoute.ACTIONS.indexOf(m.name.toUpperCase())>=0);
    }

    public method:Method;
    public path:any;
    public params:any;
    public regexp:any;
    public action:string;
    constructor(path:string,method:Method){
        this.method = method;
        this.action = method instanceof Constructor ? 'GET' : this.method.name.toUpperCase();
        this.path   = path;
        this.params = [];
        this.regexp = [];
        path.split('/').forEach(part=>{
            if(part[0]==':'){
                var [m,p,r] = part.match(/:([a-zA-Z0-9_\\-]+)(.*)/);
                this.params.push(p);
                this.regexp.push('([a-zA-Z0-9_\\-]+)'+r);
            }else
            if(part[0]=='*'){
                this.params.push(part.substring(1));
                this.regexp.push('(.*)');
            }else{
                this.regexp.push(part);
            }
        });
        this.regexp = new RegExp('^'+this.action+'\\s+'+this.regexp.join('\\/')+'$');
    }
    match(path){
        return path.match(this.regexp);
    }
    execute(options:any,...args):any{
        //route.resource.prototype[route.action].apply(resource,matched);
        let instance = new (<any>this.method.owner.value)(...args);
        Object.defineProperties(instance,{
            path     : {value:options.path},
            query    : {value:options.query},
            params   : {value:options.params},
            headers  : {value:options.headers},
            body     : {value:options.body},
            request  : {value:options.request},
            response : {value:options.response}
        });
        if(this.method instanceof Constructor){
            return instance;
        }else{
            return this.method.invoke(instance,...options.matched);
        }

    }
    toJSON(){
        return {
            method    : this.method.toString(),
            path      : this.path,
            params    : this.params,
            regexp    : this.regexp.toString()
        }
    }
    toString(){
        return 'Route('+this.regexp.toString()+')';
    }
}

@Server.handler('rest')
export class RestHandler extends Handler {
    static get routes():{[k:string]:RestRoute}{
        return Object.defineProperty(this,'routes',{
            enumerable:true,
            value:Object.create(null)
        }).routes;
    }
    static register(path,resource:Class){
        resource.getMembers(m=>RestRoute.isActionMethod(m)).forEach((method:Method)=>{
            let route = new RestRoute(path,method);
            let routeId = route.toString();
            if(!this.routes[routeId]){
                this.routes[routeId] = route;
            }else{
                route = this.routes[routeId];
                throw new Error(`Cant route '${method.toString()}' to '${path}' it's already bounded to ${route.method.toString()}`);
            }
        });
    }

    private config:any;

    constructor(){
        super();
        this.config = RestHandler.config;
    }
    accept(req,res){

    }
    handle(req,res){
        var url = Node.Url.parse(req.url,true);
        var root = this.config.path;
        var method = req.method.toUpperCase();
        var headers = req.headers;
        var query = url.query;
        if(url.pathname==root){
            res.writeHead(200,{
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                routes:RestHandler.routes,
                config:RestHandler.config
            }));
        } else
        if(url.pathname.indexOf(root)==0){
            var route,matched,path = method+' '+url.pathname.replace(root,'');

            for(var r in RestHandler.routes){
                route = RestHandler.routes[r];
                if(matched = route.match(path)){
                    break;
                }
            }
            if(matched){
                matched.shift();
                var match = route.toJSON();
                match.params = {};
                match.query = query;
                match.headers = headers;
                route.params.forEach((p,i)=>{
                    match.params[p] = matched[i];
                });

                //resource.path = match.params;
                //resource.method = match.params;
                //resource.params = match.params;

                var promise:Promise<any> = Promise.resolve();
                promise = promise.then(()=>{
                    var result = req.body;
                    if(req.body && req.body.length){
                        try{
                            result = JSON.parse(req.body.toString('utf8'));
                        }catch(ex){}
                    }
                    return result;
                });
                promise = promise.then(body=>{
                    if(match.body = body){
                        matched.push(body);
                    }
                    match.matched = matched;
                    match.request = req;
                    match.response = res;
                    return route.execute(match)
                });

                promise = promise.then(result=>{
                    if(result == null || typeof result == 'undefined'){
                        return Result.create({
                            error   : 'Resource Not Found',
                            code    : 404
                        },404);
                    }
                    if(result instanceof Result){
                        return result;
                    }else{
                        return Result.create(JSON.stringify(result,null,'  '),200,{
                            'Content-Type': 'application/json'
                        });
                    }
                });
                promise = promise.catch(result=>{
                    if(result == null || typeof result == 'undefined'){
                        return Result.create({
                            error   : 'Resource Not Found',
                            code    : 404
                        },404);
                    }
                    if(result instanceof Result){
                        return result;
                    }else
                    if(result instanceof Error){
                        return Result.create({
                            error   : result.message,
                            code    : result.code||500,
                            details : result.details,
                            stack   : result.stack.split("\n")
                        },500);
                    }else{
                        return Result.create({
                            error   : 'Unknown Server Error',
                            code    : 500,
                            data    : result
                        },500);
                    }
                });
                promise = promise.then(result=>{
                    res.writeHead(result.status,result.headers);
                    if(result.value){
                        if(typeof result.value!="string" && !(result.value instanceof Buffer)){
                            res.end(JSON.stringify(result.value));
                        }else{
                            res.end(result.value);
                        }
                    }else{
                        res.end();
                    }

                });

                return promise;
            }else{
               // console.info(path,res);
                res.writeHead(404,{
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    error   : 'Invalid Resource',
                    code    : 404
                }));
            }

        }
    }
}

