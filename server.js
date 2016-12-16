system.register("http/server", ['./node', "runtime/events", "runtime/decorators"], function(system,module,jsx) {
    var node_1, events_1, decorators_1;
    var Server = (function (__super) {
        Server.initResponse = function (res) {
        };
        Server.initRequest = function (req) {
        };
        Object.defineProperty(Server, "handlers", {
            get: function () {
                return Object.defineProperty(this, 'handlers', {
                    value: Object.create(null)
                }).handlers;
            },
            enumerable: true,
            configurable: true
        });
        ;
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
            this.server = new node_1.default.Http.Server();
            this.server.on('request', this.emit.bind(this, 'request'));
            this.server.on('upgrade', this.emit.bind(this, 'upgrade'));
            this.server.listen(this.config.port, this.config.host);
            this.on('request', this.doRequest);
            this.on('upgrade', this.doUpgrade);
            Object.keys(this.config).forEach(function (name) {
                if (Server.handlers[name]) {
                    _this.handlers[name] = new (Server.handlers[name].configure(_this, _this.config[name]))();
                }
            });
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
        Server.prototype.doUpgrade = function (req, socket, body) { };
        Server.__initializer = function(__parent){
            __super=__parent;
        };
        Server.__decorator = function(__decorate,__type){
            __decorate(144,"doRequest",20,Function,void 0,[
                [decorators_1.Bound]
            ],[
                ["req",0,Object],
                ["res",0,Object]
            ]);
            __decorate(144,"doUpgrade",20,Function,void 0,[
                [decorators_1.Bound]
            ],[
                ["req",0,Object],
                ["socket",0,Object],
                ["body",0,Object]
            ]);
            Server = 
            __decorate(217, "constructor", 80, null, null, null, [
                ["config",0,Object]
            ],[
                events_1.Emitter
            ],null,null);
        };
        return Server;
        function Server(config) {
            __super.call(this);
            this.config = config;
            this.handlers = Object.create(null);
        }
    })();
    module.define('class', Server);
    module.export("Server", Server);
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (decorators_1_1) {
                decorators_1 = decorators_1_1;
            }],
        execute: function() {
            Server = module.init(Server,events_1.Emitter);
        }
    }
});
//# sourceMappingURL=server.js.map