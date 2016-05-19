import {Socket} from "node/net";
import {EventEmitter} from "node/events";
import {IncomingMessage} from "node/http";
import * as CRYPTO from 'node/crypto';


export enum WsOpCode {
    CHUNK   = 0x00,
    TEXT    = 0x01,
    BINARY  = 0x02,
    CLOSE   = 0x08,
    PING    = 0x09,
    PONG    = 0x0A
}
export enum WsState {
    CONNECTING,OPEN
}

export class WsFrame {
    static MAX_SIZE = 128 * 1024;
    static decode(data:Buffer,isServer:boolean):WsFrame{
        var fin, opcode, B, HB, mask, len, payload, start, i, hasMask;

        if (data.length < 2) {
            return
        }
        // Is this the last frame in a sequence?
        B = data[0];
        HB = B >> 4;
        if (HB % 8) {
            // RSV1, RSV2 and RSV3 must be clear
            return null
        }
        fin = HB === 8;
        opcode = B % 16;

        if (opcode !== 0 && opcode !== 1 && opcode !== 2 &&
            opcode !== 8 && opcode !== 9 && opcode !== 10) {
            // Invalid opcode
            return null
        }
        if (opcode >= 8 && !fin) {
            // Control frames must not be fragmented
            return null
        }
        B = data[1];
        hasMask = B >> 7;
        if ((isServer && !hasMask) || (!isServer && hasMask)) {
            // Frames sent by clients must be masked
            return null
        }
        len = B % 128;
        start = hasMask ? 6 : 2;
        if (data.length < start + len) {
            // Not enough data in the buffer
            return null
        }
        // Get the actual payload length
        if (len === 126) {
            len = data.readUInt16BE(2);
            start += 2
        } else
        if (len === 127) {
            // Warning: JS can only store up to 2^53 in its number format
            len = data.readUInt32BE(2) * Math.pow(2, 32) + data.readUInt32BE(6);
            start += 8
        }
        if (data.length < start + len) {
            return null
        }
        // Extract the payload
        payload = data.slice(start, start + len);
        if (hasMask) {
            // Decode with the given mask
            mask = data.slice(start - 4, start);
            for (i = 0; i < payload.length; i++) {
                payload[i] ^= mask[i % 4]
            }
        }
        return new WsFrame(fin,opcode,payload,start + len);
    }
    static createFrames(op:WsOpCode,data:Buffer,handler:(b:Buffer)=>void){
        var start = 0, end = start+WsFrame.MAX_SIZE, first=true;
        while(start<data.length){
            var first = start==0;
            var end = Math.min(start + WsFrame.MAX_SIZE,data.length);
            var buffer = data.slice(start,start=end);
            handler(this.createFrame(first?op:WsOpCode.CHUNK,buffer,end>=data.length));
        }
    }
    static createFrame(op:WsOpCode,data:Buffer,fin:boolean=true,masked:boolean=false):Buffer {
        var payload, meta;
        if (masked) {
            payload = new Buffer(data.length);
            data.copy(payload)
        } else {
            payload = data;
        }
        meta = this.createMetaData(fin, op, masked, payload);
        return Buffer.concat([meta, payload], meta.length + payload.length)
    }
    static createMetaData(fin:boolean, opcode:WsOpCode, masked:boolean, payload:Buffer) {
        var len, meta, start, mask, i;
        len = payload.length;
        // Creates the buffer for meta-data
        meta = new Buffer(2 + (len < 126 ? 0 : (len < 65536 ? 2 : 8)) + (masked ? 4 : 0))
        // Sets fin and opcode
        meta[0] = (fin ? 128 : 0) + opcode;
        // Sets the mask and length
        meta[1] = masked ? 128 : 0;
        start = 2;
        if (len < 126) {
            meta[1] += len
        } else if (len < 65536) {
            meta[1] += 126;
            meta.writeUInt16BE(len, 2);
            start += 2
        } else {
            // Warning: JS doesn't support integers greater than 2^53
            meta[1] += 127;
            meta.writeUInt32BE(Math.floor(len / Math.pow(2, 32)), 2);
            meta.writeUInt32BE(len % Math.pow(2, 32), 6);
            start += 8
        }

        // Set the mask-key
        if (masked) {
            mask = new Buffer(4);
            for (i = 0; i < 4; i++) {
                meta[start + i] = mask[i] = Math.floor(Math.random() * 256)
            }
            for (i = 0; i < payload.length; i++) {
                payload[i] ^= mask[i % 4]
            }
            start += 4
        }

        return meta
    }

    public fin:boolean;
    public op:WsOpCode;
    public data:Buffer;
    public size:number;
    public code:number;

    constructor(fin:boolean,opcode:WsOpCode,payload:Buffer,size:number){
        this.fin = fin;
        this.op = opcode;
        this.size = size;
        this.data = payload;
    }
    inspect(){
        var length = this.data?this.data.length:0;
        return {
            fin     : this.fin,
            op      : this.op,
            size    : this.size,
            length  : this.size-length
        }
    }
}

export class WsError extends Error {
    public code:number;
    constructor(code,message){
        super(message);
        this.code = code;
    }
    toString(){
        return `${this.code} ${this.message}`;
    }
}
export class WsConnection extends EventEmitter{

    protected server:boolean;
    protected state:WsState;
    protected headers:any;
    protected socket:Socket;

    private reading:WsOpCode;
    private readingBuffer:Buffer;

    private queue:{op:WsOpCode,data:Buffer}[];

    get version():string{
        return this.headers['sec-websocket-version'].toLowerCase();
    }
    get origin():string{
        return this.headers['origin'].toLowerCase();
    }
    get key():string{
        return this.headers['sec-websocket-key'];
    }
    get id():string{
        return Object.defineProperty(this,'id',<PropertyDescriptor>{
            enumerable:true,
            writable:false,
            configurable:false,
            value:CRYPTO
                .createHash('md5')
                .update(this.hash,'ascii')
                .digest('hex')
        }).id;
    }
    get hash():string{
        return Object.defineProperty(this,'hash',<PropertyDescriptor>{
            enumerable:true,
            writable:false,
            configurable:false,
            value:CRYPTO
                .createHash('sha1')
                .update(`${this.key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`,'ascii')
                .digest('base64')
        }).hash;
    }
    get protocols():string[]{
        return String(this.headers['sec-websocket-protocol'])
            .trim()
            .toLowerCase()
            .split(',')
            .map(p=>p&&p.trim());
    }
    
    private ping:string;
    private pinger:any;
    constructor(isServer:boolean){
        super();
        var socket,headers,state=WsState.CONNECTING,buffer=new Buffer(0);
        this.queue=[];
        Object.defineProperty(this,'state',<PropertyDescriptor>{
            enumerable  : false,
            get         : ()=>state,
            set         : (v)=>state=v
        });
        Object.defineProperty(this,'socket',<PropertyDescriptor>{
            enumerable   : false,
            configurable : true,
            set          : (v)=>{
                v.on('close',(ok:boolean)=>{
                    this.onClose(new Buffer(ok?"0001":"0000"));
                });
                v.on('connect',(ok:boolean)=>{
                    console.info('connect',ok);
                });
                v.on('data', (data)=>{
                    if(data.length){
                        buffer = Buffer.concat([buffer,data]);
                        var frame = WsFrame.decode(buffer,isServer);
                        if(frame){
                            buffer = buffer.slice(frame.size);
                            this.onFrame(frame);
                        }
                    }
                });
                v.on('drain',(ok:boolean)=>{
                    //console.info('drain');
                });
                v.on('end', (data?)=>{
                    //console.info("END SOCKET END");
                    if(data && data.length){
                        buffer = Buffer.concat([buffer,data]);
                        var frame = WsFrame.decode(buffer,isServer);
                        if(frame){
                            buffer = buffer.slice(frame.size);
                            this.onFrame(frame);
                        }
                    }
                });
                v.on('error', (e?:Error)=>{
                    console.info('onError',e.stack);
                    v.destroy();
                });
                Object.defineProperty(this,'socket',<PropertyDescriptor>{
                    enumerable      : false,
                    configurable    : false,
                    value           : v
                });
                this.pinger = setInterval(()=>{
                    this.sendPing();
                },5000);
            }
        });
        Object.defineProperty(this,'headers',<PropertyDescriptor>{
            enumerable      : false,
            configurable    : true,
            set             : (v)=>{
                Object.defineProperty(this,'headers',<PropertyDescriptor>{
                    enumerable      : false,
                    configurable    : false,
                    value           : v
                });
            }
        });
        Object.defineProperty(this,'server',<PropertyDescriptor>{
            enumerable      : false,
            configurable    : true,
            set             : (v)=>{
                Object.defineProperty(this,'server',<PropertyDescriptor>{
                    enumerable      : false,
                    configurable    : false,
                    value           : v
                });
            }
        });

    }

    public connect(){
        this.server = false;
        return true;
    }
    public accept(request:IncomingMessage,protocol:string):boolean{
        this.server = true;
        this.headers = request.headers;
        if(this.version != '13') {
            throw new WsError(400,`Unsupported Socket Version ${this.version}`);
        } else
        if(this.protocols.indexOf(protocol)<0){
            return false;
        }else{
            this.socket = request.socket;
            return true;
        }
    }

    protected onFrame(frame:WsFrame){
        this.emit('frame',frame);
        if(frame.fin){
            switch(frame.op){
                case WsOpCode.BINARY : return this.onBinary(frame.data);
                case WsOpCode.TEXT : return this.onText(frame.data);
                case WsOpCode.PONG : return this.onPong(frame.data);
                case WsOpCode.PING : return this.onPing(frame.data);
                case WsOpCode.CLOSE : return this.onClose(frame.data);
                case WsOpCode.CHUNK : return this.onStreamDone(frame.data);
                default : throw new Error('Invalid Frame')
            }
        }else{
            switch(frame.op){
                case WsOpCode.BINARY    : return this.onStreamBinary(frame.data);
                case WsOpCode.TEXT      : return this.onStreamText(frame.data);
                case WsOpCode.CHUNK     : return this.onStreamChunk(frame.data);
                default : throw new Error('Invalid Frame')
            }
        }

    }
    protected onText(buffer:Buffer){
        this.emit('text',buffer.toString());
    }
    protected onBinary(buffer:Buffer){
        this.emit('binary',buffer);
    }
    protected onPong(buffer:Buffer){
        var time  = buffer.toString();
        //console.info("ON PONG",this.id,time,time==this.ping);
        this.ping = null;
        this.emit('pong',time);
    }
    protected onPing(buffer:Buffer){
        //console.info("ON PING");
        this.emit('ping',buffer);
        this.sendFrame(WsOpCode.PONG,buffer);
    }
    protected onClose(buffer:Buffer){
        var code    = 0;
        var message = "";
        if(buffer){
            code    = buffer.readUInt16BE(0);
            message = buffer.toString('utf8',2);
        }
        clearInterval(this.pinger);
        this.emit('close',code,message);
    }
    protected onStreamBinary(buffer:Buffer){
        this.reading = WsOpCode.BINARY;
        if(this.listeners('stream').length){
            this.emit('stream',buffer,this.reading,'start');
        }else{
            this.readingBuffer = buffer
        }
    }
    protected onStreamText(buffer:Buffer){
        this.reading = WsOpCode.TEXT;
        if(this.listeners('stream').length){
            this.emit('stream',buffer,this.reading,'start');
        }else{
            this.readingBuffer = buffer
        }
    }
    protected onStreamChunk(buffer:Buffer){
        if(this.listeners('stream').length){
            this.emit('stream',buffer,this.reading,'chunk');
        }else{
            this.readingBuffer = Buffer.concat(
                [this.readingBuffer,buffer],
                this.readingBuffer.length+buffer.length
            );
        }
    }
    protected onStreamDone(buffer:Buffer){
        if(this.listeners('stream').length){
            this.emit('stream',buffer,this.reading,'chunk');
        }else{
            this.readingBuffer = Buffer.concat(
                [this.readingBuffer,buffer],
                this.readingBuffer.length+buffer.length
            );
            switch(this.reading){
                case WsOpCode.TEXT : this.onText(this.readingBuffer); break;
                case WsOpCode.BINARY : this.onBinary(this.readingBuffer); break;
            }
            this.reading=null;
            this.readingBuffer=null;
        }
    }
    protected sendFrame(op:WsOpCode,data:Buffer){
        this.queue.push({op,data});
        if(this.queue.length==1){
            while (this.queue.length) {
                var op:WsOpCode = this.queue[0].op;
                var data:Buffer = this.queue[0].data;
                WsFrame.createFrames(op, data, (frame:Buffer)=> {
                    this.socket.write(frame);
                });
                this.queue.shift();
            }
        }
    }
    protected sendPing(){
        if(!this.ping){
            this.ping=new Date().toISOString();
            this.sendFrame(WsOpCode.PING,new Buffer(this.ping));
        }
    }
    public sendText(text:string){
        this.sendFrame(WsOpCode.TEXT,new Buffer(text))
    }
    public sendBinary(buffer:Buffer){
        this.sendFrame(WsOpCode.BINARY,buffer)
    }

}