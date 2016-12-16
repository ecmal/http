system.register("http/ws/driver/proxy", ["node/url", "node/stream", "./base", "./headers", "./http_parser"], function(system,module,jsx) {
    var url, stream_1, base_1, headers_1, http_parser_1;
    var PORTS;
    var Proxy = (function (__super) {
        Proxy.prototype.setHeader = function (name, value) {
            if (this._state !== 0)
                return false;
            this._headers.set(name, value);
            return true;
        };
        Proxy.prototype.start = function () {
            if (this._state !== 0)
                return false;
            this._state = 1;
            var origin = this._origin, port = origin.port || PORTS[origin.protocol], start = 'CONNECT ' + origin.hostname + ':' + port + ' HTTP/1.1';
            var headers = [start, this._headers.toString(), ''];
            this.emit('data', new Buffer(headers.join('\r\n'), 'utf8'));
            return true;
        };
        Proxy.prototype.pause = function () {
            this._paused = true;
        };
        Proxy.prototype.resume = function () {
            this._paused = false;
            this.emit('drain');
        };
        Proxy.prototype.write = function (chunk) {
            if (!this.writable)
                return false;
            this._http.parse(chunk);
            if (!this._http.isComplete())
                return !this._paused;
            this.statusCode = this._http.statusCode;
            this.headers = this._http.headers;
            if (this.statusCode === 200) {
                this.emit('connect', new base_1.Base.ConnectEvent());
            }
            else {
                var message = "Can't establish a connection to the server at " + this._origin.href;
                this.emit('error', new Error(message));
            }
            this.end();
            return !this._paused;
        };
        Proxy.prototype.end = function (chunk) {
            if (!this.writable)
                return;
            if (chunk !== undefined)
                this.write(chunk);
            this.readable = this.writable = false;
            this.emit('close');
            this.emit('end');
        };
        Proxy.prototype.destroy = function () {
            this.end();
        };
        Proxy.__initializer = function(__parent){
            __super=__parent;
        };
        return Proxy;
        function Proxy(client, origin, options) {
            __super.call(this);
            this._client = client;
            this._http = new http_parser_1.HttpParser('response');
            this._origin = (typeof client.url === 'object') ? client.url : url.parse(client.url);
            this._url = (typeof origin === 'object') ? origin : url.parse(origin);
            this._options = options || {};
            this._state = 0;
            this.readable = this.writable = true;
            this._paused = false;
            this._headers = new headers_1.Headers();
            this._headers.set('Host', this._origin.host);
            this._headers.set('Connection', 'keep-alive');
            this._headers.set('Proxy-Connection', 'keep-alive');
            var auth = this._url.auth && new Buffer(this._url.auth, 'utf8').toString('base64');
            if (auth)
                this._headers.set('Proxy-Authorization', 'Basic ' + auth);
        }
    })();
    module.define('class', Proxy);
    module.export("Proxy", Proxy);
    return {
        setters:[
            function (url_1) {
                url = url_1;
            },
            function (stream_1_1) {
                stream_1 = stream_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (headers_1_1) {
                headers_1 = headers_1_1;
            },
            function (http_parser_1_1) {
                http_parser_1 = http_parser_1_1;
            }],
        execute: function() {
            PORTS = { 'ws:': 80, 'wss:': 443 };
            Proxy = module.init(Proxy,stream_1.Stream);
        }
    }
});
//# sourceMappingURL=proxy.js.map