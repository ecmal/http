import {Stream} from "node/stream";
import {Driver} from "./driver";
import {Base} from "./driver/base";
import {Event} from "./events";
import {EventTarget} from "./events";


export class API extends Stream implements EventTarget {

    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    public readable:boolean;
    public writable:boolean;
    public readyState;
    public bufferedAmount;
    public protocol;
    public url;
    public version;

    protected _driver:Base;
    protected _ping;
    protected _pingId;
    protected _pingTimer;
    protected _proxy;
    protected _stream;
    protected _closeParams;

    constructor(options?) {
        super();
        if(options){
            this._configureApi(options);
        }
    }

    public write(data) {
        return this.send(data);
    }
    public end(data) {
        if (data !== undefined) this.send(data);
        this.close();
    }
    public pause() {
        return this._driver.messages.pause();
    }
    public resume() {
        return this._driver.messages.resume();
    }
    public send(data) {
        if (this.readyState > API.OPEN) return false;
        if (!Buffer.isBuffer(data)){
            data = String(data);
        }
        return this._driver.messages.write(data);
    }
    public ping(message, callback?) {
        if (this.readyState > API.OPEN) return false;
        return this._driver.ping(message, callback);
    }
    public close(code?, reason?) {
        if (code === undefined) code = 1000;
        if (reason === undefined) reason = '';

        if (code !== 1000 && (code < 3000 || code > 4999))
            throw new Error("Failed to execute 'close' on WebSocket: " +
                "The code must be either 1000, or between 3000 and 4999. " +
                code + " is neither.");
        if (this.readyState !== API.CLOSED) this.readyState = API.CLOSING;
        this._driver.close(reason, code);
    }

    public onopen    : (event)=>void  = null;
    public onmessage : (event)=>void  = null;
    public onerror   : (event)=>void  = null;
    public onclose   : (event)=>void  = null;

    public addEventListener(eventType, listener, useCapture) {
        this['on'](eventType, listener);
    }
    public removeEventListener(eventType, listener, useCapture) {
        this['off'](eventType, listener);
    }
    public dispatchEvent(event) {
        event.target = event.currentTarget = this;
        event.eventPhase = Event.AT_TARGET;
        if (this['on' + event.type])
            this['on' + event.type](event);
        this['emit'](event.type, event);
    }

    protected _configureApi(options) {
        Driver.validateOptions(options, [
            'headers', 'extensions', 'maxLength', 'ping', 'proxy', 'tls', 'ca'
        ]);
        this.readable = this.writable = true;
        this._ping = options.ping;
        this._pingId = 0;
        this.readyState = API.CONNECTING;
        this.bufferedAmount = 0;
        this.protocol = '';
        this.url = this._driver.url;
        this.version = this._driver.version;
        this._driver.on('open', (e)=> {
            this._open()
        });
        this._driver.on('message', (e)=> {
            this._receiveMessage(e.data)
        });
        this._driver.on('close', (e)=> {
            this._beginClose(e.reason, e.code)
        });
        this._driver.on('error', (e)=> {
            this._emitError(e.message);
        });
        this._driver.messages.on('drain',()=>{this.emit('drain')});

        var headers = options.headers;
        if (headers) {
            for (var name in headers) {
                this._driver.setHeader(name, headers[name]);
            }
        }

        var extensions = options.extensions;
        if (extensions) {
            extensions.forEach(e=> {
                this._driver.addExtension(e)
            });
        }

        this.on('error', function () {
        });

        if (this._ping)
            this._pingTimer = setInterval(()=>{
                this._pingId += 1;
                this.ping(this._pingId.toString());
            }, this._ping * 1000);

        this._configureStream();

        if (!this._proxy) {
            this._stream.pipe(this._driver.io);
            this._driver.io.pipe(this._stream);
        }
    }
    protected _configureStream() {
        var self = this;

        this._stream.setTimeout(0);
        this._stream.setNoDelay(true);

        ['close', 'end'].forEach(function (event) {
            this._stream.on(event, function () {
                self._finalizeClose()
            });
        }, this);

        this._stream.on('error', function (error) {
            self._emitError('Network error: ' + self.url + ': ' + error.message);
            self._finalizeClose();
        });
    }
    protected _open() {
        if (this.readyState !== API.CONNECTING) return;

        this.readyState = API.OPEN;
        this.protocol = this._driver.protocol || '';

        var event = new Event('open');
        event.initEvent('open', false, false);
        this.dispatchEvent(event);
    }
    protected _receiveMessage(data) {
        if (this.readyState > API.OPEN) return false;
        if (this.readable) this.emit('data', data);

        var event = new Event('message', {data: data});
        event.initEvent('message', false, false);
        this.dispatchEvent(event);
    }
    protected _emitError(message) {
        if (this.readyState >= API.CLOSING) return;

        var event = new Event('error', {message: message});
        event.initEvent('error', false, false);
        this.dispatchEvent(event);
    }
    protected _beginClose(reason, code) {
        if (this.readyState === API.CLOSED) return;
        this.readyState = API.CLOSING;
        this._closeParams = [reason, code];

        if (this._stream) {
            this._stream.end();
            if (!this._stream.readable) this._finalizeClose();
        }
    }
    protected _finalizeClose() {
        if (this.readyState === API.CLOSED) return;
        this.readyState = API.CLOSED;

        if (this._pingTimer) clearInterval(this._pingTimer);
        if (this._stream) this._stream.end();

        if (this.readable) this.emit('end');
        this.readable = this.writable = false;

        var reason = this._closeParams ? this._closeParams[0] : '',
            code = this._closeParams ? this._closeParams[1] : 1006;

        var event = new Event('close', {code: code, reason: reason});
        event.initEvent('close', false, false);
        this.dispatchEvent(event);
    }
}




