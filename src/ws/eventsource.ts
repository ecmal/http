import {Stream} from "node/stream";
import {Driver} from "./driver";
import {Headers} from "./driver/headers";
import {API} from "./api";
import {EventTarget} from "./events";
import {Event} from "./events";

export class EventSource extends Stream implements EventTarget {
    static isEventSource(request) {
        if (request.method !== 'GET'){
            return false;
        }
        var accept = (request.headers.accept || '').split(/\s*,\s*/);
        return accept.indexOf('text/event-stream') >= 0;
    }
    public writable:boolean;
    public url:string;
    public lastEventId:string;
    public readyState:number;

    public DEFAULT_PING  = 10;
    public DEFAULT_RETRY = 5;

    public onopen    : (event)=>void  = null;
    public onmessage : (event)=>void  = null;
    public onerror   : (event)=>void  = null;
    public onclose   : (event)=>void  = null;

    protected _stream:any;
    protected _ping:number;
    protected _pingTimer:any;
    protected _retry:number;

    public constructor(request, response, options) {
        super();
        this.writable = true;
        options = options || {};

        this._stream = response.socket;
        this._ping = options.ping || this.DEFAULT_PING;
        this._retry = options.retry || this.DEFAULT_RETRY;

        var scheme = Driver.isSecureRequest(request) ? 'https:' : 'http:';
        this.url = scheme + '//' + request.headers.host + request.url;
        this.lastEventId = request.headers['last-event-id'] || '';
        this.readyState = API.CONNECTING;

        var headers = new Headers();

        if (options.headers) {
            for (var key in options.headers) {
                headers.set(key, options.headers[key]);
            }
        }

        if (!this._stream || !this._stream.writable) {
            return;
        }
        system.node.process.nextTick(()=> {
            this._open()
        });

        this._stream.setTimeout(0);
        this._stream.setNoDelay(true);

        var handshake = 'HTTP/1.1 200 OK\r\n' +
            'Content-Type: text/event-stream\r\n' +
            'Cache-Control: no-cache, no-store\r\n' +
            'Connection: close\r\n' +
            headers.toString() +
            '\r\n' +
            'retry: ' + Math.floor(this._retry * 1000) + '\r\n\r\n';

        this._write(handshake);

        this._stream.on('drain', ()=>{this.emit('drain')});

        if (this._ping) {
            this._pingTimer = setInterval(()=> {
                this.ping()
            }, this._ping * 1000);
        }

        ['error', 'end'].forEach((event)=> {
            this._stream.on(event,()=>{
                this.close()
            });
        });
    }
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
    public write(message) {
        return this.send(message);
    }
    public end(message) {
        if (message !== undefined) this.write(message);
        this.close();
    }
    public send(message, options?) {
        if (this.readyState > API.OPEN) return false;

        message = String(message).replace(/(\r\n|\r|\n)/g, '$1data: ');
        options = options || {};

        var frame = '';
        if (options.event) frame += 'event: ' + options.event + '\r\n';
        if (options.id)    frame += 'id: '    + options.id    + '\r\n';
        frame += 'data: ' + message + '\r\n\r\n';

        return this._write(frame);
    }
    public ping() {
        return this._write(':\r\n\r\n');
    }
    public close() {
        if (this.readyState > API.OPEN) return false;

        this.readyState = API.CLOSED;
        this.writable = false;
        if (this._pingTimer) clearInterval(this._pingTimer);
        if (this._stream) this._stream.end();

        var event = new Event('close');
        event.initEvent('close', false, false);
        this.dispatchEvent(event);

        return true;
    }
    protected _write(chunk) {
    if (!this.writable) return false;
    try {
        return this._stream.write(chunk, 'utf8');
    } catch (e) {
        return false;
    }
}
    protected _open() {
    if (this.readyState !== API.CONNECTING) return;

    this.readyState = API.OPEN;

    var event = new Event('open');
    event.initEvent('open', false, false);
    this.dispatchEvent(event);
}
}



module.exports = EventSource;