import Node from './node';
import {Emitter} from "runtime/events";
import {Bound} from "runtime/decorators";


export class Server extends Emitter {

    static initResponse(res) {
    }
    static initRequest(req) {
    }
    static get handlers(){
        return Object.defineProperty(this,'handlers',{
            value:Object.create(null)
        }).handlers
    };
    static handler(name){
        return handler=>{
            Object.defineProperty(Server.handlers,name,<PropertyDescriptor>{
                enumerable  : true,
                value       : handler
            })
        }
    }

    public handlers:any;
    public config:any;
    public server:any;

    constructor(config){
        super();
        this.config = config;
        this.handlers = Object.create(null);
    }

    public start(){
        this.server = new Node.Http.Server();
        this.server.on('request',this.emit.bind(this,'request'));
        this.server.on('upgrade',this.emit.bind(this,'upgrade'));
        this.server.listen(this.config.port,this.config.host);
        this.on('request',this.doRequest);
        this.on('upgrade',this.doUpgrade);
        Object.keys(this.config).forEach(name=>{
            if(Server.handlers[name]){
                this.handlers[name] = new (Server.handlers[name].configure(this,this.config[name]))();
            }
        });
        return this;
    }
    @Bound
    protected doRequest(req,res){
        if(this.config.debug){
            console.info(req.method,req.url);
        }
        Server.initRequest(req);
        Server.initResponse(res);
        var chain = new Promise((resolve,reject)=>{
            var body = new Buffer(0);
            req.on('data',(chunk)=>{
                body=Buffer.concat([body,chunk],body.length+chunk.length);
            });
            req.on('end',()=>{
                req.body = body;
                resolve();
            });
        });
        Object.keys(this.handlers).forEach(name=>{
            var handler = this.handlers[name];
            chain = chain.then(()=>{
                if(!res.finished){
                    if(typeof handler.handle=='function'){
                        return handler.handle(req,res);
                    }
                }else{
                    return true;
                }
            });
        });
        chain.then(
            s=>{
                if(res.stream){
                    res.stream.pipe(res);
                }else{
                    res.end();
                }
            },
            e=>{
            console.error(e.stack);
                res.writeHead(500,{
                    'Content-Type' : 'text/plain'
                });
                res.end(e.stack);
            }
        );
        return chain;
    }
    @Bound
    protected doUpgrade(req,socket,body){}
}