system.register("http/ws/client", ["node/net", "node/tls", "node/url", "./driver", "./api"], function(system,module,jsx) {
    var net, tls, url, driver_1, api_1;
    var DEFAULT_PORTS, SECURE_PROTOCOLS;
    var Client = (function (__super) {
        Client.prototype._onConnect = function () {
            var worker = this._proxy || this._driver;
            worker.start();
        };
        Client.prototype._configureProxy = function (proxy, originTLS) {
            var uri = url.parse(this.url), secure = SECURE_PROTOCOLS.indexOf(uri.protocol) >= 0, self = this, name;
            this._proxy = this._driver.proxy(proxy.origin);
            if (proxy.headers) {
                for (name in proxy.headers)
                    this._proxy.setHeader(name, proxy.headers[name]);
            }
            this._proxy.pipe(this._stream, { end: false });
            this._stream.pipe(this._proxy);
            this._proxy.on('connect', function () {
                if (secure) {
                    var options = { socket: self._stream, servername: uri.hostname };
                    for (name in originTLS)
                        options[name] = originTLS[name];
                    self._stream = tls.connect(options);
                    self._configureStream();
                }
                self._driver.io.pipe(self._stream);
                self._stream.pipe(self._driver.io);
                self._driver.start();
            });
            this._proxy.on('error', function (error) {
                self._driver.emit('error', error);
            });
        };
        Client.__initializer = function(__parent){
            __super=__parent;
        };
        return Client;
        function Client(_url, protocols, options) {
            var _this = this;
            __super.call(this);
            this.url = _url;
            this._driver = driver_1.Driver.client(this.url, {
                maxLength: options.maxLength,
                protocols: protocols
            });
            ['open', 'error'].forEach(function (event) {
                _this._driver.on(event, function () {
                    _this.headers = _this._driver.headers;
                    _this.statusCode = _this._driver.statusCode;
                });
            });
            var proxy = options.proxy || {}, endpoint = url.parse(proxy.origin || this.url), port = endpoint.port || DEFAULT_PORTS[endpoint.protocol], secure = SECURE_PROTOCOLS.indexOf(endpoint.protocol) >= 0, netOptions = options.net || {}, originTLS = options.tls || {}, socketTLS = proxy.origin ? (proxy.tls || {}) : originTLS;
            netOptions.host = socketTLS.host = endpoint.hostname;
            netOptions.port = socketTLS.port = port;
            originTLS.ca = originTLS.ca || options.ca;
            socketTLS.servername = socketTLS.servername || endpoint.hostname;
            this._stream = secure
                ? tls.connect(socketTLS, function () { _this._onConnect(); })
                : net.connect(netOptions, function () { _this._onConnect(); });
            if (proxy.origin) {
                this._configureProxy(proxy, originTLS);
            }
            this._configureApi(options);
        }
    })();
    module.define('class', Client);
    module.export("Client", Client);
    return {
        setters:[
            function (net_1) {
                net = net_1;
            },
            function (tls_1) {
                tls = tls_1;
            },
            function (url_1) {
                url = url_1;
            },
            function (driver_1_1) {
                driver_1 = driver_1_1;
            },
            function (api_1_1) {
                api_1 = api_1_1;
            }],
        execute: function() {
            DEFAULT_PORTS = {
                'http:': 80,
                'https:': 443,
                'ws:': 80,
                'wss:': 443
            };
            SECURE_PROTOCOLS = [
                'https:', 'wss:'
            ];
            Client = module.init(Client,api_1.API);
        }
    }
});
//# sourceMappingURL=client.js.map