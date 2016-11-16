import {RestHandler} from './handlers/rest';
import {ViewHandler} from './handlers/view';
import {Decorator} from "runtime/decorators";
import {Member} from "runtime/reflect/member";
import {Method} from "runtime/reflect/method";
import {Constructor} from "runtime/reflect/constructor";
import {WebSocketHandler} from "./handlers/ws";

export class Path extends Decorator {
    public path:string;
    constructor(path,options?:any){
        super();
        this.path = path;
    }
    decorate(member:Member){
        throw new Error(`Invalid 'Rest' target ${member.toString()}`);
    }
}
export class Rest extends Path {
    constructor(path:string,options?:any){
        super(path);
    }
    decorate(member:Member){
        if(member instanceof Constructor){
            RestHandler.register(this.path,member.owner);
        }else{
            throw new Error(`Invalid 'Rest' target ${member.toString()}`);
        }
    }
}

export class View extends Path {
    constructor(path:string,options?:any){
        super(path);
    }
    decorate(member:Member){
        if(member instanceof Constructor){
            ViewHandler.register(this.path,member.owner);
        }else{
            throw new Error(`Invalid 'Rest' target ${member.toString()}`);
        }
    }
}

export class Template extends Path {
    constructor(path:string,options?:any){
        super(path);
    }
    decorate(member:Member){
        if(member instanceof Method){
            member.metadata.template_path = this.path;
        }else{
            throw new Error(`Invalid 'Rest' target ${member.toString()}`);
        }
    }
}
export class WebSocket extends Path {
    public options:any;
    constructor(path:string,options?:any){
        super(path);
        this.options = options;
    }
    decorate(member:Member){
        if(member instanceof Constructor){
            member.owner.metadata.ws = this.options;
            WebSocketHandler.register(this.path,member.owner);
        }else{
            throw new Error(`Invalid 'Rest' target ${member.toString()}`);
        }
    }
}




export class Result {

    public value:any;
    public status:any;
    public headers:any;

    static create(value,status=200,headers={}){
        return new Result(value,status,headers);
    }

    constructor(value,status=200,headers={}){
        this.value=value;
        this.status = status;
        this.headers = headers;
    }
}
