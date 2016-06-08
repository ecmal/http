system.register("http/ws/server", ["node/http", "node/events", "./connection"], function(system,module) {
    var http_1, events_1, http_2, connection_1, HTTP;
    var WsServer = (function (__super) {
        WsServer.create = function (server, protocol) {
            return this.inject(HTTP.createServer(), protocol);
        };
        WsServer.inject = function (server, protocol) {
            return new WsServer(server, protocol);
        };
        WsServer.prototype.newConnection = function () {
            return new connection_1.WsConnection(true);
        };
        WsServer.prototype.doUpgrade = function (req) {
            var _this = this;
            var upgrade = String(req.headers['upgrade']).trim().toLowerCase();
            if (upgrade && upgrade == 'websocket') {
                var connection = this.newConnection();
                try {
                    if (connection.accept(req, this.protocol)) {
                        this.response(req.socket, 101, 'Switching Protocols', {
                            'Connection': 'Upgrade',
                            'Upgrade': 'websocket',
                            'Sec-WebSocket-Accept': connection.hash,
                            'Sec-WebSocket-Protocol': this.protocol
                        });
                        connection.on('close', function () {
                            delete _this.connections[connection.id];
                            _this.emit('disconnect', connection);
                        });
                        this.connections[connection.id] = connection;
                        this.emit('connect', connection);
                    }
                }
                catch (e) {
                    console.info(e.stack);
                    this.response(req.socket, e.code, e.message);
                }
            }
        };
        WsServer.prototype.response = function (socket, status, message, headers, body) {
            try {
                status = status || 500;
                message = message || 'Unknown Server Error';
                var data = [("HTTP/1.1 " + status + " " + message)];
                if (headers) {
                    for (var key in headers) {
                        if (headers[key]) {
                            data.push(key + ': ' + headers[key]);
                        }
                    }
                }
                data.push('\r\n');
                socket.write(data.join('\r\n'), 'ascii');
                if (status != 101) {
                    socket.end();
                }
            }
            catch (ex) {
                console.info(ex);
            }
        };
        WsServer.__initializer = function(__parent){
            __super=__parent;
        };
        return WsServer;
        function WsServer(server, protocol) {
            var _this = this;
            __super.call(this);
            this.protocol = protocol;
            this.connections = {};
            server.on('upgrade', function (req) {
                _this.doUpgrade(req);
            });
        }
    })();
    module.define('class', WsServer);
    module.export("WsServer", WsServer);
    return {
        setters:[
            function (http_1_1) {
                http_1 = http_1_1;
                http_2 = http_1_1;
                HTTP = http_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (connection_1_1) {
                connection_1 = connection_1_1;
            }],
        execute: function() {
            WsServer = module.init(WsServer,events_1.EventEmitter);
        }
    }
});
//# sourceMappingURL=server.js.map