import {Router} from "./router";
import {Mirror} from '@ecmal/runtime/reflect';

const ROUTE = Symbol();
const PARAM = Symbol();
const QUERY = Symbol();


export function Route(path:string):ClassDecorator{
    return route(path)
}
export function route(path:string){
    return (target,key?,desc?)=>{
        Rest.register(path,target,key);
    }
}
export function Method(method,target,key,desc){
    let mirror = Mirror.get(target,key);
    if(mirror.isMethod()){
        let route = mirror.getMetadata(ROUTE) || {};
        route.method = method;
        mirror.setMetadata(ROUTE,route);
    }else{
        throw new Error(`cannot apply path to property ${key} of ${target.name}`);
    }
}
export function GET(target,key,desc){
    Method('GET',target,key,desc);
}
export function POST(target,key,desc){
    Method('POST',target,key,desc);
}
export function PUT(target,key,desc){
    Method('PUT',target,key,desc);
}
export function DELETE(target,key,desc){
    Method('DELETE',target,key,desc);
}
export function OPTIONS(target,key,desc){
    Method('OPTIONS',target,key,desc);
}
export function param(property:string){
    return Param(PARAM,property);
}
export function query(property:string){
    return Param(QUERY,property);
}

function Param(symbol:symbol,property:string){
    return (target,key?,index?)=>{
        let mirror = Mirror.get(target,key),
            metadata = mirror.getMetadata(symbol)  || {};
        if( (mirror.isMethod()) && typeof index == 'number'){
            metadata[property] = index;
            mirror.setMetadata(symbol,metadata);
        }else if( !mirror.isStatic() && !mirror.isClass() ){
            metadata[property] = key;
            mirror.setMetadata(symbol,metadata);
        }else{
            throw new Error(`cannot apply param to property ${key} of ${target.name}`);
        }
    }
}

class Rest<T> {
    static register(path,target,key){
        return new Rest(path,target,key);
    }
    constructor(
        private path    :string,
        private target  :Constructor<T>,
        key
    ){
        let mirror = Mirror.get(target,key);
        if( mirror.isClass() ){
            this.defineClassRoute();
        }else
        if( mirror.isMethod() ){
            if( mirror.isStatic() ){
                throw new Error(`cannot apply path to static member ${key} of ${mirror.getClass().getName()}`);
            }else{
               this.defineMethodRoute(key);
            }
        }else{
            throw new Error(`cannot apply path to property ${key} of ${target.name}`);
        }
    }
    private defineMethodRoute(key){
        let mirror = Mirror.get(this.target,key);
        let route = mirror.getMetadata(ROUTE) || {};
        route.path = this.path;
        mirror.setMetadata(ROUTE,route);
    }
    private defineClassRoute(){
        let members = Mirror.get(this.target).getPrototype().getMembers();
        members.forEach(member=>{
            if(  member.isMethod() ){
                let route = member.getMetadata(ROUTE),
                    name  = member.getName();
                if( route.action ){
                    return this.defineRoute(name,{
                        method : route.method
                    });
                }
                this.defineRoute(name,route);
            }
        })
    }
    private defineRoute(key,route){
        let target = this.target;
        route.path = `/${route.method}${this.path}${route.path?'/'+route.path:''}`;
        route.action = (url,request,response)=>{
            let 
                params              = url.params,
                reflect             = Mirror.get(target),
                member              = reflect.getMember(key,false),
                query               = url.query,
                args                = () => {
                    let arg = [],
                    paramMeta           = member.getMetadata(PARAM) || {},
                    queryMeta           = member.getMetadata(QUERY) || {};
                    Object.keys(params).forEach(key=>{
                        let index = paramMeta[key];
                        if( typeof index=='number' ){
                            arg[index]  = params[key];
                        }
                    });
                    Object.keys(query).forEach(key=>{
                        let index = queryMeta[key];
                        if( typeof index=='number' ){
                            arg[index]  = query[key];
                        }
                    });
                    return arg;
                },
                props = () =>{
                    let meta = {};
                    reflect.getMembers(false).forEach(member=>{
                        if( !member.isMethod() ){
                            let paramMeta           = member.getMetadata(PARAM) || {},
                                queryMeta           = member.getMetadata(QUERY) || {};
                            Object.keys(params).forEach(key=>{
                                let index = paramMeta[key];
                                if( typeof index!='undefined' ){
                                    meta[index]  = params[key];
                                }
                            });
                            Object.keys(query).forEach(key=>{
                                let index = queryMeta[key];
                                if( typeof index!='undefined' ){
                                    meta[index]  = query[key];
                                }
                            });
                        }
                    });
                    return meta;
                };

            let controller = Object.create(target.prototype,{
                url      : {value:url},
                request  : {value:request},
                response : {value:response}
            });
            let fields = props();
            Object.keys(fields).forEach(key=>{
                controller[key] = fields[key];
            });
            target.call(controller);
            return controller[key].apply(controller,args());
        };
        Router.default.define(route.path).data = route.action;
    }
}