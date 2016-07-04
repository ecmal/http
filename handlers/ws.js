system.register("http/handlers/ws", ['../node', "../server", "./handler", "../ws/socket", "runtime/reflect/class", "./rest", "runtime/reflect/method"], function(system,module,jsx) {
    var node_1, server_1, handler_1, socket_1, class_1, rest_1, method_1;
    var WebSocketHandler = (function (__super) {
        Object.defineProperty(WebSocketHandler, "routes", {
            get: function () {
                return Object.defineProperty(this, 'routes', {
                    enumerable: true,
                    value: Object.create(null)
                }).routes;
            },
            enumerable: true,
            configurable: true
        });
        WebSocketHandler.register = function (path, resource) {
            var method = resource.getConstructor();
            var route = new rest_1.RestRoute(path, method);
            var routeId = route.toString();
            if (!this.routes[routeId]) {
                this.routes[routeId] = route;
            }
            else {
                route = this.routes[routeId];
                throw new Error("Cant route '" + method.toString() + "' to '" + path + "' it's already bounded to " + route.method.toString());
            }
        };
        WebSocketHandler.prototype.getRoute = function (request, socket, body) {
            var url = node_1.default.Url.parse(request.url, true);
            var method = request.method.toUpperCase();
            var headers = request.headers;
            var query = url.query;
            var route, matched, path = method + ' ' + url.pathname;
            var _loop_1 = function(r) {
                route = WebSocketHandler.routes[r];
                if (matched = route.match(path)) {
                    matched.shift();
                    var options_1 = route.toJSON();
                    options_1.params = {};
                    options_1.query = query;
                    options_1.headers = headers;
                    options_1.matched = matched;
                    route.params.forEach(function (p, i) {
                        options_1.params[p] = matched[i];
                    });
                    return { value: route.execute(options_1, request, socket, body, route.method.owner.metadata.ws) };
                }
            };
            for (var r in WebSocketHandler.routes) {
                var state_1 = _loop_1(r);
                if (typeof state_1 === "object") return state_1.value;
            }
            return null;
        };
        WebSocketHandler.__initializer = function(__parent){
            __super=__parent;
        };
        WebSocketHandler.__decorator = function(__decorate,__type){
            __decorate(144,"getRoute",0,Function,void 0,null,[
                ["request",0,Object],
                ["socket",0,Object],
                ["body",0,Object]
            ]);
            __decorate(146,"routes",1,Object,null,null,null);
            __decorate(144,"register",1,Function,void 0,null,[
                ["path",0,Object],
                ["resource",0,class_1.Class]
            ]);
            WebSocketHandler = 
            __decorate(217, "constructor", 80, null, null, [
                [server_1.Server.handler,'ws']
            ], null,[
                handler_1.Handler
            ],null,null);
        };
        return WebSocketHandler;
        function WebSocketHandler() {
            var _this = this;
            __super.call(this);
            WebSocketHandler.server.on('upgrade', function (request, socket, body) {
                if (socket_1.Socket.isWebSocket(request)) {
                    _this.getRoute(request, socket, body);
                }
            });
        }
    })();
    module.define('class', WebSocketHandler);
    module.export("WebSocketHandler", WebSocketHandler);
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            },
            function (server_1_1) {
                server_1 = server_1_1;
            },
            function (handler_1_1) {
                handler_1 = handler_1_1;
            },
            function (socket_1_1) {
                socket_1 = socket_1_1;
            },
            function (class_1_1) {
                class_1 = class_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (method_1_1) {
                method_1 = method_1_1;
            }],
        execute: function() {
            WebSocketHandler = module.init(WebSocketHandler,handler_1.Handler);
        }
    }
});
//# sourceMappingURL=ws.js.map