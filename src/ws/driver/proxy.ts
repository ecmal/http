import * as url from "node/url";
import {Stream} from "node/stream";
import {Base} from "./base";
import {Headers} from "./headers";
import {HttpParser} from "./http_parser";


const PORTS = {'ws:': 80, 'wss:': 443};

export class Proxy extends Stream {

    public readable;
    public writable;
    public statusCode;
    public headers;

    private _client;
    private _http;
    private _origin;
    private _url;
    private _options;
    private _state;
    private _paused;
    private _headers;

    constructor(client, origin, options) {
        super();
        this._client = client;
        this._http = new HttpParser('response');
        this._origin = (typeof client.url === 'object') ? client.url : url.parse(client.url);
        this._url = (typeof origin === 'object') ? origin : url.parse(origin);
        this._options = options || {};
        this._state = 0;

        this.readable = this.writable = true;
        this._paused = false;

        this._headers = new Headers();
        this._headers.set('Host', this._origin.host);
        this._headers.set('Connection', 'keep-alive');
        this._headers.set('Proxy-Connection', 'keep-alive');

        var auth = this._url.auth && new Buffer(this._url.auth, 'utf8').toString('base64');
        if (auth) this._headers.set('Proxy-Authorization', 'Basic ' + auth);
    }

    public setHeader(name, value) {
        if (this._state !== 0) return false;
        this._headers.set(name, value);
        return true;
    }
    public start() {
        if (this._state !== 0) return false;
        this._state = 1;

        var origin = this._origin,
            port = origin.port || PORTS[origin.protocol],
            start = 'CONNECT ' + origin.hostname + ':' + port + ' HTTP/1.1';

        var headers = [start, this._headers.toString(), ''];

        this.emit('data', new Buffer(headers.join('\r\n'), 'utf8'));
        return true;
    }
    public pause() {
        this._paused = true;
    }
    public resume() {
        this._paused = false;
        this.emit('drain');
    }
    public write(chunk) {
        if (!this.writable) return false;

        this._http.parse(chunk);
        if (!this._http.isComplete()) return !this._paused;

        this.statusCode = this._http.statusCode;
        this.headers = this._http.headers;

        if (this.statusCode === 200) {
            this.emit('connect', new Base.ConnectEvent());
        } else {
            var message = "Can't establish a connection to the server at " + this._origin.href;
            this.emit('error', new Error(message));
        }
        this.end();
        return !this._paused;
    }
    public end(chunk?) {
        if (!this.writable) return;
        if (chunk !== undefined) this.write(chunk);
        this.readable = this.writable = false;
        this.emit('close');
        this.emit('end');
    }
    public destroy() {
        this.end();
    }
}


