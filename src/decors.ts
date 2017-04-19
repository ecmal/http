import {Router} from "./router";

const metadata = Symbol('metadata');
class Metadata{
    static get(target:Function):Metadata{
        if(!target[metadata]){
            Object.defineProperty(target,metadata,{
                value:new Metadata()
            })
        }
        return target[metadata];
    }
    [key:string]:any;
    get(key:string,value?:any):any{
        if(typeof this[key]=='undefined' && arguments.length>1){
            this[key] = value;
        }
        return this[key];
    }
    set(key:string,value:any):this{
        this[key] = value;
        return this;
    }
}
export function Path(path:string){
    function defineClassRoute(target){
        let routes = Metadata.get(target).get('routes');
        Object.keys(routes).forEach(key=>{
            let route = routes[key];
            if( route.action ){
                return defineRoute(target,key,{
                    method : route.method
                });
            }
            defineRoute(target,key,route);
        })
    }
    function defineRoute(target,key,route){
        route.path = `/${route.method}${path}${route.path?'/'+route.path:''}`;
        route.action = (url,params,request,response)=>{
            let controller = Object.create(target.prototype,{
                url      : {value:url},
                params   : {value:params},
                request  : {value:request},
                response : {value:response}
            });
            target.call(controller);
            return controller[key].call(controller);
        };
        Router.default.define(route.path).data = route.action;
    }
    function defineMethodRoute(target,key){
        let routes = Metadata.get(target).get('routes',{});
        if(!routes[key]){
            routes[key] = {}
        }
        routes[key].path = path;
    }
    return (target,key?,desc?)=>{
        if(typeof target=='function'){
            if(key){
                throw new Error(`cannot apply path to static member ${key} of ${target.name}`);
            }else{
                defineClassRoute(target);
            }
        }else{
            if(typeof desc.value == 'function'){
                defineMethodRoute(target.constructor,key);
            }else{
                throw new Error(`cannot apply path to property ${key} of ${target.name}`);
            }
        }
    }
}
export function Method(method,target,key,desc){
    if(typeof desc.value == 'function'){
        let routes = Metadata.get(target.constructor).get('routes',{});
        if(!routes[key]){
            routes[key] = {}
        }
        routes[key].method = method;
    }else{
        throw new Error(`cannot apply path to property ${key} of ${target.name}`);
    }
}
export function Get(target,key,desc){
    Method('GET',target,key,desc);
}
export function Post(target,key,desc){
    Method('POST',target,key,desc);
}
export function Put(target,key,desc){
    Method('PUT',target,key,desc);
}
export function Delete(target,key,desc){
    Method('DELETE',target,key,desc);
}
export function Options(target,key,desc){
    Method('OPTIONS',target,key,desc);
}