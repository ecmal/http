system.register("http/ws/driver/server", ['./base', './http_parser', './hybi'], function(system,module,jsx) {
    'use strict';
    var base_1, http_parser_1, hybi_1;
    var Server = (function (__super) {
        Server.isWebSocket = function (request) {
            if (request.method !== 'GET') {
                return false;
            }
            var connection = request.headers.connection || '', upgrade = request.headers.upgrade || '';
            return (connection.toLowerCase().split(/\s*,\s*/).indexOf('upgrade') >= 0 &&
                upgrade.toLowerCase() === 'websocket');
        };
        Server.isSecureRequest = function (request) {
            if (request.connection && request.connection.authorized !== undefined)
                return true;
            if (request.socket && request.socket.secure)
                return true;
            var headers = request.headers;
            if (!headers)
                return false;
            if (headers['https'] === 'on')
                return true;
            if (headers['x-forwarded-ssl'] === 'on')
                return true;
            if (headers['x-forwarded-scheme'] === 'https')
                return true;
            if (headers['x-forwarded-proto'] === 'https')
                return true;
            return false;
        };
        Server.determineUrl = function (request) {
            var scheme = this.isSecureRequest(request) ? 'wss:' : 'ws:';
            return scheme + '//' + request.headers.host + request.url;
        };
        Server.http = function (request, options) {
            options = options || {};
            if (options.requireMasking === undefined)
                options.requireMasking = true;
            var headers = request.headers, url = this.determineUrl(request);
            if (headers['sec-websocket-version']) {
                return new hybi_1.Hybi(request, url, options);
            }
            else {
                throw new Error('Unsupported WebSocket version');
            }
        };
        Server.prototype.parse = function (chunk) {
            if (this._delegate)
                return this._delegate.parse(chunk);
            this._http.parse(chunk);
            if (!this._http.isComplete())
                return;
            this.method = this._http.method;
            this.url = this._http.url;
            this.headers = this._http.headers;
            this.body = this._http.body;
            var self = this;
            this._delegate = Server.http(this, this._options);
            this._delegate.messages = this.messages;
            this._delegate.io = this.io;
            this._open();
            this.EVENTS.forEach(function (event) {
                this._delegate.on(event, function (e) { self.emit(event, e); });
            }, this);
            this.protocol = this._delegate.protocol;
            this.version = this._delegate.version;
            this.parse(this._http.body);
            this.emit('connect', new base_1.Base.ConnectEvent());
        };
        Server.prototype._bindEventListeners = function () {
            this.messages.on('error', function () { });
            this.on('error', function () { });
        };
        Server.prototype._open = function () {
            this.__queue.forEach(function (msg) {
                this._delegate[msg[0]].apply(this._delegate, msg[1]);
            }, this);
            this.__queue = [];
        };
        Server.__initializer = function(__parent){
            __super=__parent;
        };
        return Server;
        function Server(options) {
            __super.call(this, null, null, (function () {
                options = options || {};
                if (options.requireMasking === undefined) {
                    options.requireMasking = true;
                }
                return options;
            })());
            this.EVENTS = ['open', 'message', 'error', 'close'];
            this._http = new http_parser_1.HttpParser('request');
        }
    })();
    module.define('class', Server);
    module.export("Server", Server);
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (http_parser_1_1) {
                http_parser_1 = http_parser_1_1;
            },
            function (hybi_1_1) {
                hybi_1 = hybi_1_1;
            }],
        execute: function() {
            Server = module.init(Server,base_1.Base);
            ['addExtension', 'setHeader', 'start', 'frame', 'text', 'binary', 'ping', 'close'].forEach(function (method) {
                Server.prototype[method] = function () {
                    if (this._delegate) {
                        return this._delegate[method].apply(this._delegate, arguments);
                    }
                    else {
                        this.__queue.push([method, arguments]);
                        return true;
                    }
                };
            });
        }
    }
});
//# sourceMappingURL=server.js.map