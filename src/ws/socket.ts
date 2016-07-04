import {Driver} from "./driver";
import {PerMessageDeflate} from "./extensions/deflate-pm";
import {OpenEvent, MessageEvent} from "./driver/base";
import {Hybi} from "./driver/hybi";
import {Cached} from "runtime/decorators";

export class Socket  {
    static connections:Set<Socket>;
    static isWebSocket(request){
        return Driver.isWebSocket(request)
    }

    protected path:any;
    protected query:any;
    protected headers:any;
    protected params:any;
    protected driver:Hybi;

    @Cached
    protected get id():string{
        return new Buffer(this.driver.key,'base64').toString('hex');
    }

    protected get extensions():any[]{
        return [new PerMessageDeflate()];
    }

    constructor(request?, socket?, body?, options?:any) {
        Promise.resolve(true).then(r=>this.accept()).then(r=>{
            if(r){
                this.start(request, socket, body, options);
                this.driver.start();
            }else{
                socket.end();
            }
        },e=>socket.end());
    }

    protected accept():any{
        return true;
    }

    protected start(request?, socket?, body?, options?:any){
        Object.defineProperty(this,'driver',{
           value : <Hybi>Driver.http(request,options)
        });
        this.driver.on('open',(event:OpenEvent)=>{
            let connections:Set<Socket> = this.constructor['connections'];
            if(!connections){
                Object.defineProperty(this.constructor,'connections',{
                    configurable    : true,
                    value           : connections = new Set<Socket>()
                })
            }
            connections.add(this);
            this.onOpen(this.id);
        });
        this.driver.on('message',(event:MessageEvent)=>{
            this.onMessage(event.data);
        });
        this.driver.on('close',(event:OpenEvent)=>{
            let connections:Set<Socket> = this.constructor['connections'];
            if(connections){
                connections.delete(this)
            }
            this.onClose(this.id)
        });
        this.driver.on('error',(error)=>{
            try{this.onError(error)}catch(ex){
                try{
                    this.close(error.message,error.code||1006);
                }finally{
                    let connections:Set<Socket> = this.constructor['connections'];
                    if(!connections){
                        connections.delete(this)
                    }
                }
            }
        });
        this.driver.io.write(body);
        socket.pipe(this.driver.io).pipe(socket);
        this.extensions.forEach(e=>{
            this.driver.addExtension(e)
        });
        this.driver.start();
    }
    public send(message){
        if(Buffer.isBuffer(message)){
            this.binary(message);
        }else{
            if(typeof message != 'string'){
                message = JSON.stringify(message)
            } 
            this.text(message);
        }
    }
    public text(message:string):boolean {
        return this.driver.text(message);
    }
    public binary(message:Buffer):boolean {
        return this.driver.binary(message);
    }
    public ping(message, callback?):boolean {
        return this.driver.ping(message,callback)
    }
    public pong(message):boolean {
        return this.driver.pong(message)
    }
    public close(reason?, code?):boolean {
        return this.driver.close(reason,code)
    }

    protected onOpen(id:string){}
    protected onMessage(data:any){}
    protected onClose(id:string){

    }
    protected onError(error){
        throw new Error(error.message||error);
    }

    protected toJSON(){
        return {
            id      : this.id,
            path    : this.path,
            params  : this.params,
            query   : this.query,
            headers : this.headers
        }
    }
}



