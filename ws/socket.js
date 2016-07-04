system.register("http/ws/socket", ["./driver", "./extensions/deflate-pm", "./driver/base", "./driver/hybi", "runtime/decorators"], function(system,module,jsx) {
    var driver_1, deflate_pm_1, base_1, hybi_1, decorators_1;
    var Socket = (function (__super) {
        Socket.isWebSocket = function (request) {
            return driver_1.Driver.isWebSocket(request);
        };
        Object.defineProperty(Socket.prototype, "id", {
            get: function () {
                return new Buffer(this.driver.key, 'base64').toString('hex');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Socket.prototype, "extensions", {
            get: function () {
                return [new deflate_pm_1.PerMessageDeflate()];
            },
            enumerable: true,
            configurable: true
        });
        Socket.prototype.accept = function () {
            return true;
        };
        Socket.prototype.start = function (request, socket, body, options) {
            var _this = this;
            Object.defineProperty(this, 'driver', {
                value: driver_1.Driver.http(request, options)
            });
            this.driver.on('open', function (event) {
                var connections = _this.constructor['connections'];
                if (!connections) {
                    Object.defineProperty(_this.constructor, 'connections', {
                        configurable: true,
                        value: connections = new Set()
                    });
                }
                connections.add(_this);
                _this.onOpen(_this.id);
            });
            this.driver.on('message', function (event) {
                _this.onMessage(event.data);
            });
            this.driver.on('close', function (event) {
                var connections = _this.constructor['connections'];
                if (connections) {
                    connections.delete(_this);
                }
                _this.onClose(_this.id);
            });
            this.driver.on('error', function (error) {
                try {
                    _this.onError(error);
                }
                catch (ex) {
                    try {
                        _this.close(error.message, error.code || 1006);
                    }
                    finally {
                        var connections = _this.constructor['connections'];
                        if (!connections) {
                            connections.delete(_this);
                        }
                    }
                }
            });
            this.driver.io.write(body);
            socket.pipe(this.driver.io).pipe(socket);
            this.extensions.forEach(function (e) {
                _this.driver.addExtension(e);
            });
            this.driver.start();
        };
        Socket.prototype.send = function (message) {
            if (Buffer.isBuffer(message)) {
                this.binary(message);
            }
            else {
                if (typeof message != 'string') {
                    message = JSON.stringify(message);
                }
                this.text(message);
            }
        };
        Socket.prototype.text = function (message) {
            return this.driver.text(message);
        };
        Socket.prototype.binary = function (message) {
            return this.driver.binary(message);
        };
        Socket.prototype.ping = function (message, callback) {
            return this.driver.ping(message, callback);
        };
        Socket.prototype.pong = function (message) {
            return this.driver.pong(message);
        };
        Socket.prototype.close = function (reason, code) {
            return this.driver.close(reason, code);
        };
        Socket.prototype.onOpen = function (id) { };
        Socket.prototype.onMessage = function (data) { };
        Socket.prototype.onClose = function (id) {
        };
        Socket.prototype.onError = function (error) {
            throw new Error(error.message || error);
        };
        Socket.prototype.toJSON = function () {
            return {
                id: this.id,
                path: this.path,
                params: this.params,
                query: this.query,
                headers: this.headers
            };
        };
        Socket.__decorator = function(__decorate,__type){
            __decorate(146,"id",20,String,null,[
                [decorators_1.Cached]
            ],null);
            Socket = 
            __decorate(217, "constructor", 80, null, null, null, [
                ["request",1,Object],
                ["socket",1,Object],
                ["body",1,Object],
                ["options",1,Object]
            ],null,null,null);
        };
        return Socket;
        function Socket(request, socket, body, options) {
            var _this = this;
            Promise.resolve(true).then(function (r) { return _this.accept(); }).then(function (r) {
                if (r) {
                    _this.start(request, socket, body, options);
                    _this.driver.start();
                }
                else {
                    socket.end();
                }
            }, function (e) { return socket.end(); });
        }
    })();
    module.define('class', Socket);
    module.export("Socket", Socket);
    return {
        setters:[
            function (driver_1_1) {
                driver_1 = driver_1_1;
            },
            function (deflate_pm_1_1) {
                deflate_pm_1 = deflate_pm_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (hybi_1_1) {
                hybi_1 = hybi_1_1;
            },
            function (decorators_1_1) {
                decorators_1 = decorators_1_1;
            }],
        execute: function() {
            Socket = module.init(Socket);
        }
    }
});
//# sourceMappingURL=socket.js.map