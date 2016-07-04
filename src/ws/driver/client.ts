import * as url from 'node/url';
import * as crypto from 'node/crypto';

import {Hybi} from "./hybi";
import {Base} from "./base";
import {Proxy} from "./proxy";
import {HttpParser} from "./http_parser";


export class Client extends Hybi {
    static generateKey() {
        return crypto.randomBytes(16).toString('base64');
    }
    public version:string;
    public _key:string;
    public _pathname:string;
    public _protocols:string[];
    public _accept:string;
    public _http:HttpParser;
    public VALID_PROTOCOLS = ['ws:', 'wss:'];
    public statusCode:number;
    public headers:number;

    constructor(_url, options) {
        super(null, _url, (()=>{
            options = options || {};
            if (options.masking === undefined){
                options.masking = true;
            }
            return options;
        })());
        this.version = 'hybi-13';
        this.readyState = -1;
        this._key       = Client.generateKey();
        this._accept    = Hybi.generateAccept(this._key);
        this._http      = new HttpParser('response');
        var uri  = url.parse(this.url),
            auth = uri.auth && new Buffer(uri.auth, 'utf8').toString('base64');

        if (this.VALID_PROTOCOLS.indexOf(uri.protocol) < 0)
            throw new Error(this.url + ' is not a valid WebSocket URL');

        this._pathname = (uri.pathname || '/') + (uri.search || '');

        this._headers.set('Host', uri.host);
        this._headers.set('Upgrade', 'websocket');
        this._headers.set('Connection', 'Upgrade');
        this._headers.set('Sec-WebSocket-Key', this._key);
        this._headers.set('Sec-WebSocket-Version', '13');

        if (this._protocols.length > 0)
            this._headers.set('Sec-WebSocket-Protocol', this._protocols.join(', '));

        if (auth)
            this._headers.set('Authorization', 'Basic ' + auth);
    }

    public proxy(origin, options) {
        return new Proxy(this, origin, options);
    }
    public start() {
        if (this.readyState !== -1) return false;
        this._write(this._handshakeRequest());
        this.readyState = 0;
        return true;
    }
    public parse(chunk) {
        if (this.readyState === 3) return;
        if (this.readyState > 0) return Hybi.prototype.parse.call(this, chunk);

        this._http.parse(chunk);
        if (!this._http.isComplete()) return;

        this._validateHandshake();
        if (this.readyState === 3) return;

        this._open();
        this.parse(this._http.body);
    }

    protected _handshakeRequest() {
        var extensions = this._extensions.generateOffer();
        if (extensions)
            this._headers.set('Sec-WebSocket-Extensions', extensions);

        var start   = 'GET ' + this._pathname + ' HTTP/1.1',
            headers = [start, this._headers.toString(), ''];

        return new Buffer(headers.join('\r\n'), 'utf8');
    }
    protected _failHandshake(message) {
        message = 'Error during WebSocket handshake: ' + message;
        this.readyState = 3;
        this.emit('error', new Error(message));
        this.emit('close', new Base.CloseEvent(this.ERRORS.protocol_error, message));
    }
    protected _validateHandshake() {
        this.statusCode = this._http.statusCode;
        this.headers    = this._http.headers;

        if (this._http.statusCode !== 101)
            return this._failHandshake('Unexpected response code: ' + this._http.statusCode);

        var headers    = this._http.headers,
            upgrade    = headers['upgrade'] || '',
            connection = headers['connection'] || '',
            accept     = headers['sec-websocket-accept'] || '',
            protocol   = headers['sec-websocket-protocol'] || '';

        if (upgrade === '')
            return this._failHandshake("'Upgrade' header is missing");
        if (upgrade.toLowerCase() !== 'websocket')
            return this._failHandshake("'Upgrade' header value is not 'WebSocket'");

        if (connection === '')
            return this._failHandshake("'Connection' header is missing");
        if (connection.toLowerCase() !== 'upgrade')
            return this._failHandshake("'Connection' header value is not 'Upgrade'");

        if (accept !== this._accept)
            return this._failHandshake('Sec-WebSocket-Accept mismatch');

        this.protocol = null;

        if (protocol !== '') {
            if (this._protocols.indexOf(protocol) < 0)
                return this._failHandshake('Sec-WebSocket-Protocol mismatch');
            else
                this.protocol = protocol;
        }

        try {
            this._extensions.activate(this.headers['sec-websocket-extensions']);
        } catch (e) {
            return this._failHandshake(e.message);
        }
    }
}

