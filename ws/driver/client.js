system.register("http/ws/driver/client", ['node/url', 'node/crypto', "./hybi", "./base", "./proxy", "./http_parser"], function(system,module,jsx) {
    var url, crypto, hybi_1, base_1, proxy_1, http_parser_1;
    var Client = (function (__super) {
        Client.generateKey = function () {
            return crypto.randomBytes(16).toString('base64');
        };
        Client.prototype.proxy = function (origin, options) {
            return new proxy_1.Proxy(this, origin, options);
        };
        Client.prototype.start = function () {
            if (this.readyState !== -1)
                return false;
            this._write(this._handshakeRequest());
            this.readyState = 0;
            return true;
        };
        Client.prototype.parse = function (chunk) {
            if (this.readyState === 3)
                return;
            if (this.readyState > 0)
                return hybi_1.Hybi.prototype.parse.call(this, chunk);
            this._http.parse(chunk);
            if (!this._http.isComplete())
                return;
            this._validateHandshake();
            if (this.readyState === 3)
                return;
            this._open();
            this.parse(this._http.body);
        };
        Client.prototype._handshakeRequest = function () {
            var extensions = this._extensions.generateOffer();
            if (extensions)
                this._headers.set('Sec-WebSocket-Extensions', extensions);
            var start = 'GET ' + this._pathname + ' HTTP/1.1', headers = [start, this._headers.toString(), ''];
            return new Buffer(headers.join('\r\n'), 'utf8');
        };
        Client.prototype._failHandshake = function (message) {
            message = 'Error during WebSocket handshake: ' + message;
            this.readyState = 3;
            this.emit('error', new Error(message));
            this.emit('close', new base_1.Base.CloseEvent(this.ERRORS.protocol_error, message));
        };
        Client.prototype._validateHandshake = function () {
            this.statusCode = this._http.statusCode;
            this.headers = this._http.headers;
            if (this._http.statusCode !== 101)
                return this._failHandshake('Unexpected response code: ' + this._http.statusCode);
            var headers = this._http.headers, upgrade = headers['upgrade'] || '', connection = headers['connection'] || '', accept = headers['sec-websocket-accept'] || '', protocol = headers['sec-websocket-protocol'] || '';
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
            }
            catch (e) {
                return this._failHandshake(e.message);
            }
        };
        Client.__initializer = function(__parent){
            __super=__parent;
        };
        return Client;
        function Client(_url, options) {
            __super.call(this, null, _url, (function () {
                options = options || {};
                if (options.masking === undefined) {
                    options.masking = true;
                }
                return options;
            })());
            this.VALID_PROTOCOLS = ['ws:', 'wss:'];
            this.version = 'hybi-13';
            this.readyState = -1;
            this._key = Client.generateKey();
            this._accept = hybi_1.Hybi.generateAccept(this._key);
            this._http = new http_parser_1.HttpParser('response');
            var uri = url.parse(this.url), auth = uri.auth && new Buffer(uri.auth, 'utf8').toString('base64');
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
    })();
    module.define('class', Client);
    module.export("Client", Client);
    return {
        setters:[
            function (url_1) {
                url = url_1;
            },
            function (crypto_1) {
                crypto = crypto_1;
            },
            function (hybi_1_1) {
                hybi_1 = hybi_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (proxy_1_1) {
                proxy_1 = proxy_1_1;
            },
            function (http_parser_1_1) {
                http_parser_1 = http_parser_1_1;
            }],
        execute: function() {
            Client = module.init(Client,hybi_1.Hybi);
        }
    }
});
//# sourceMappingURL=client.js.map