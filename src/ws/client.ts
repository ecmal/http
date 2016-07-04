import * as net from "node/net";
import * as tls from "node/tls";
import * as url from "node/url";

import {Driver} from "./driver";
import {API} from "./api";

const DEFAULT_PORTS    = {
    'http:'   : 80,
    'https:'  : 443,
    'ws:'     : 80,
    'wss:'    : 443
};
const SECURE_PROTOCOLS = [
    'https:', 'wss:'
];

export class Client extends API {
    public headers:any;
    public statusCode:number;

    constructor(_url, protocols, options) {
        super();
        this.url     = _url;
        this._driver = Driver.client(this.url, {
            maxLength: options.maxLength,
            protocols: protocols
        });
        ['open', 'error'].forEach((event)=>{
            this._driver.on(event,()=>{
                this.headers    = this._driver.headers;
                this.statusCode = this._driver.statusCode;
            });
        });
        var proxy      = options.proxy || {},
            endpoint   = url.parse(proxy.origin || this.url),
            port       = endpoint.port || DEFAULT_PORTS[endpoint.protocol],
            secure     = SECURE_PROTOCOLS.indexOf(endpoint.protocol) >= 0,
            netOptions = options.net || {},
            originTLS  = options.tls || {},
            socketTLS  = proxy.origin ? (proxy.tls || {}) : originTLS;

        netOptions.host = socketTLS.host = endpoint.hostname;
        netOptions.port = socketTLS.port = port;

        originTLS.ca = originTLS.ca || options.ca;
        socketTLS.servername = socketTLS.servername || endpoint.hostname;

        this._stream = secure
            ? tls.connect(socketTLS, ()=>{ this._onConnect() })
            : net.connect(netOptions, ()=>{ this._onConnect() });

        if (proxy.origin) {
            this._configureProxy(proxy, originTLS);
        }
        this._configureApi(options)
    }
    protected _onConnect() {
        var worker = this._proxy || this._driver;
        worker.start();
    }
    protected _configureProxy(proxy, originTLS) {
        var uri    = url.parse(this.url),
            secure = SECURE_PROTOCOLS.indexOf(uri.protocol) >= 0,
            self   = this,
            name;

        this._proxy = this._driver.proxy(proxy.origin);

        if (proxy.headers) {
            for (name in proxy.headers) this._proxy.setHeader(name, proxy.headers[name]);
        }

        this._proxy.pipe(this._stream, {end: false});
        this._stream.pipe(this._proxy);

        this._proxy.on('connect', function() {
            if (secure) {
                var options = {socket: self._stream, servername: uri.hostname};
                for (name in originTLS) options[name] = originTLS[name];
                self._stream = tls.connect(options);
                self._configureStream();
            }
            self._driver.io.pipe(self._stream);
            self._stream.pipe(self._driver.io);
            self._driver.start();
        });

        this._proxy.on('error', function(error) {
            self._driver.emit('error', error);
        });
    }
}

