System.register(['./node'], function(exports_1) {
    var node_1;
    var Server;
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            Server = (function () {
                function Server(config) {
                    this.config = config;
                    this.handlers = Object.create(null);
                    this.doRequest = this.doRequest.bind(this);
                }
                Server.initResponse = function (res) {
                };
                Server.initRequest = function (req) {
                };
                Server.handler = function (name) {
                    return function (handler) {
                        Object.defineProperty(Server.handlers, name, {
                            enumerable: true,
                            value: handler
                        });
                    };
                };
                Server.prototype.start = function () {
                    var _this = this;
                    Object.keys(this.config).forEach(function (name) {
                        if (Server.handlers[name]) {
                            _this.handlers[name] = new (Server.handlers[name].configure(_this, _this.config[name]))();
                        }
                    });
                    this.server = new node_1.default.Http.Server();
                    this.server.on('request', this.doRequest);
                    this.server.listen(this.config.port, this.config.host);
                    return this;
                };
                Server.prototype.doRequest = function (req, res) {
                    var _this = this;
                    if (this.config.debug) {
                        console.info(req.method, req.url);
                    }
                    Server.initRequest(req);
                    Server.initResponse(res);
                    var chain = new Promise(function (resolve, reject) {
                        var body = new Buffer(0);
                        req.on('data', function (chunk) {
                            body = Buffer.concat([body, chunk], body.length + chunk.length);
                        });
                        req.on('end', function () {
                            req.body = body;
                            resolve();
                        });
                    });
                    Object.keys(this.handlers).forEach(function (name) {
                        var handler = _this.handlers[name];
                        chain = chain.then(function () {
                            if (!res.finished) {
                                if (typeof handler.handle == 'function') {
                                    return handler.handle(req, res);
                                }
                            }
                            else {
                                return true;
                            }
                        });
                    });
                    chain.then(function (s) {
                        if (res.stream) {
                            res.stream.pipe(res);
                        }
                        else {
                            res.end();
                        }
                    }, function (e) {
                        console.error(e.stack);
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end(e.stack);
                    });
                    return chain;
                };
                Server.handlers = Object.create(null);
                return Server;
            })();
            exports_1("Server", Server);
        }
    }
});
//# sourceMappingURL=server.js.map