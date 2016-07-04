import {EventEmitter} from 'node/events';
import {IO,Messages} from './streams';
import {Headers} from './headers';
import {StreamReader} from './stream_reader';

export class ConnectEvent {}
export class OpenEvent {}
export class CloseEvent {
    public code   :number;
    public reason :string;
    constructor(code, reason){
        this.code   = code;
        this.reason = reason;
    }
}
export class MessageEvent {
    public data :any;
    constructor(data){
        this.data = data;
    }
}

export class Base extends EventEmitter {

    static ConnectEvent = ConnectEvent;
    static OpenEvent = OpenEvent;
    static CloseEvent = CloseEvent;
    static MessageEvent = MessageEvent;
    static validateOptions(options, validKeys){
        for (var key in options) {
            if (validKeys.indexOf(key) < 0)
                throw new Error('Unrecognized option: ' + key);
        }
    }

    public MAX_LENGTH =  0x3ffffff;
    public STATES = ['connecting', 'open', 'closing', 'closed'];
    public readyState:any;
    public url:any;
    public version:string;
    public io:IO;
    public messages:Messages;
    public protocol:string;
    public headers:any;
    public statusCode:number;

    protected _request:any;
    protected _reader:StreamReader;
    protected _options:any;
    protected _maxLength:any;
    protected _headers:any;
    protected _stage:any;
    protected __queue:any;

    public constructor(request, url, options){
        super();
        Base.validateOptions(options || {}, ['maxLength', 'masking', 'requireMasking', 'protocols']);
        this._request   = request;
        this._reader    = new StreamReader();
        this._options   = options || {};
        this._maxLength = this._options.maxLength || this.MAX_LENGTH;
        this._headers   = new Headers();
        this.__queue    = [];
        this.readyState = 0;
        this.url        = url;
        this.io         = new IO(this);
        this.messages   = new Messages(this);
        this._bindEventListeners();
    }
    public parse(chunk){
        throw new Error('abstract function')
    }
    public proxy(origin,options?){
        throw new Error('abstract function')
    }
    public getState() {
        return this.STATES[this.readyState] || null;
    }
    public addExtension(extension) {
        return false;
    }
    public setHeader(name, value) {
        if (this.readyState > 0) return false;
        this._headers.set(name, value);
        return true;
    }
    public start() {
        if (this.readyState !== 0) return false;
        var response = this._handshakeResponse();
        if (!response) return false;
        this._write(response);
        if (this._stage !== -1){
            this._open();
        }
        return true;
    }
    public text(message) {
        return this.frame(message);
    }
    public binary(message) {
        return false;
    }
    public ping(message?, callback?) {
        return false;
    }
    public pong(message?) {
        return false;
    }
    public close(reason, code) {
        if (this.readyState !== 1) return false;
        this.readyState = 3;
        this.emit('close', new Base.CloseEvent(null, null));
        return true;
    }
    public frame(buffer, type?, code?){
        throw new Error('abstract function')
    }
    protected _handshakeResponse() {}
    protected _bindEventListeners() {
        // Protocol errors are informational and do not have to be handled
        this.messages.on('error',(e)=>{});
        this.on('message',(event)=>{
            if (this.messages.readable){
                this.messages.emit('data', event.data);
            }
        });
        this.on('error',(error)=>{
            if (this.messages.readable){
                this.messages.emit('error', error);
            }
        });
        this.on('close', function() {
            if (this.messages.readable){
                this.messages.readable = this.messages.writable = false;
                this.messages.emit('end');
            }
        });
    }
    protected _open() {
        this.readyState = 1;
        this.__queue.forEach(function(args) {
            this.frame.apply(this, args)
        }, this);
        this.__queue = [];
        this.emit('open', new Base.OpenEvent());
    }
    protected _queue(message) {
        this.__queue.push(message);
        return true;
    }
    protected _write(chunk) {
        var io = this.io;
        if (io.readable){
            io.emit('data', chunk);
        }
    }
}
