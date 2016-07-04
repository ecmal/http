'use strict';
import {Base} from './base';
import {HttpParser} from './http_parser';
import {Hybi} from './hybi';



export class Server  extends Base {
    static isWebSocket(request) {
        if (request.method !== 'GET'){
            return false;
        }
        let connection = request.headers.connection || '',
            upgrade    = request.headers.upgrade || '';

        return (
            connection.toLowerCase().split(/\s*,\s*/).indexOf('upgrade') >= 0 &&
            upgrade.toLowerCase() === 'websocket'
        );
    }
    static isSecureRequest(request) {
        if (request.connection && request.connection.authorized !== undefined) return true;
        if (request.socket && request.socket.secure) return true;

        var headers = request.headers;
        if (!headers) return false;
        if (headers['https'] === 'on') return true;
        if (headers['x-forwarded-ssl'] === 'on') return true;
        if (headers['x-forwarded-scheme'] === 'https') return true;
        if (headers['x-forwarded-proto'] === 'https') return true;

        return false;
    }
    static determineUrl(request) {
        var scheme = this.isSecureRequest(request) ? 'wss:' : 'ws:';
        return scheme + '//' + request.headers.host + request.url;
    }
    static http(request, options?):Base {
        options = options || {};
        if (options.requireMasking === undefined) options.requireMasking = true;
        var headers = request.headers,
            url     = this.determineUrl(request);
        if (headers['sec-websocket-version']){
            return new Hybi(request, url, options);
        }else{
            throw new Error('Unsupported WebSocket version');
        }

    }
    public EVENTS = ['open', 'message', 'error', 'close'];
    public method:string;
    public headers:string;
    public body:string;
    public protocol:string;
    public version:string;

    private _http:HttpParser;
    private _delegate:any;

    constructor(options) {
        super(null, null, (()=>{
            options = options || {};
            if (options.requireMasking === undefined){
                options.requireMasking = true;
            }
            return options;
        })());
        this._http = new HttpParser('request');
    }

    public parse(chunk) {
        if (this._delegate) return this._delegate.parse(chunk);

        this._http.parse(chunk);
        if (!this._http.isComplete()) return;

        this.method  = this._http.method;
        this.url     = this._http.url;
        this.headers = this._http.headers;
        this.body    = this._http.body;

        var self = this;
        this._delegate = Server.http(this, this._options);
        this._delegate.messages = this.messages;
        this._delegate.io = this.io;
        this._open();

        this.EVENTS.forEach(function(event) {
            this._delegate.on(event, function(e) { self.emit(event, e) });
        }, this);

        this.protocol = this._delegate.protocol;
        this.version  = this._delegate.version;

        this.parse(this._http.body);
        this.emit('connect', new Base.ConnectEvent());
    }
    protected _bindEventListeners() {
        this.messages.on('error', function() {});
        this.on('error', function() {});
    }
    protected _open() {
        this.__queue.forEach(function(msg) {
            this._delegate[msg[0]].apply(this._delegate, msg[1]);
        }, this);
        this.__queue = [];
    }
}


['addExtension', 'setHeader', 'start', 'frame', 'text', 'binary', 'ping', 'close'].forEach(function(method) {
    Server.prototype[method] = function() {
        if (this._delegate) {
            return this._delegate[method].apply(this._delegate, arguments);
        } else {
            this.__queue.push([method, arguments]);
            return true;
        }
    };
});


