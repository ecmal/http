system.register("http/handlers/rest", ['../node', '../server', '../mime', './handler', '../rest', "runtime/reflect/class", "runtime/reflect/method", "runtime/reflect/member", "runtime/reflect/constructor"], function(system,module,jsx) {
    var node_1, server_1, mime_1, handler_1, rest_1, class_1, method_1, member_1, constructor_1;
    var RestRoute = (function (__super) {
        RestRoute.isActionMethod = function (m) {
            return (m instanceof method_1.Method && RestRoute.ACTIONS.indexOf(m.name.toUpperCase()) >= 0);
        };
        RestRoute.prototype.match = function (path) {
            return path.match(this.regexp);
        };
        RestRoute.prototype.execute = function (options) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            //route.resource.prototype[route.action].apply(resource,matched);
            var instance = new ((_a = this.method.owner.value).bind.apply(_a, [void 0].concat(args)))();
            Object.defineProperties(instance, {
                path: { value: options.path },
                query: { value: options.query },
                params: { value: options.params },
                headers: { value: options.headers },
                body: { value: options.body },
            });
            if (this.method instanceof constructor_1.Constructor) {
                return instance;
            }
            else {
                return (_b = this.method).invoke.apply(_b, [instance].concat(options.matched));
            }
            var _a, _b;
        };
        RestRoute.prototype.toJSON = function () {
            return {
                method: this.method.toString(),
                path: this.path,
                params: this.params,
                regexp: this.regexp.toString()
            };
        };
        RestRoute.prototype.toString = function () {
            return 'Route(' + this.regexp.toString() + ')';
        };
        RestRoute.__initializer = function(__parent){
            __super=__parent;
            RestRoute.ACTIONS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
        };
        return RestRoute;
        function RestRoute(path, method) {
            var _this = this;
            this.method = method;
            this.action = method instanceof constructor_1.Constructor ? 'GET' : this.method.name.toUpperCase();
            this.path = path;
            this.params = [];
            this.regexp = [];
            path.split('/').forEach(function (part) {
                if (part[0] == ':') {
                    var _a = part.match(/:([a-zA-Z0-9_\\-]+)(.*)/), m = _a[0], p = _a[1], r = _a[2];
                    _this.params.push(p);
                    _this.regexp.push('([a-zA-Z0-9_\\-]+)' + r);
                }
                else if (part[0] == '*') {
                    _this.params.push(part.substring(1));
                    _this.regexp.push('(.*)');
                }
                else {
                    _this.regexp.push(part);
                }
            });
            this.regexp = new RegExp('^' + this.action + '\\s+' + this.regexp.join('\\/') + '$');
        }
    })();
    module.define('class', RestRoute);
    module.export("RestRoute", RestRoute);
    var RestHandler = (function (__super) {
        Object.defineProperty(RestHandler, "routes", {
            get: function () {
                return Object.defineProperty(this, 'routes', {
                    enumerable: true,
                    value: Object.create(null)
                }).routes;
            },
            enumerable: true,
            configurable: true
        });
        RestHandler.register = function (path, resource) {
            var _this = this;
            resource.getMembers(function (m) { return RestRoute.isActionMethod(m); }).forEach(function (method) {
                var route = new RestRoute(path, method);
                var routeId = route.toString();
                if (!_this.routes[routeId]) {
                    _this.routes[routeId] = route;
                }
                else {
                    route = _this.routes[routeId];
                    throw new Error("Cant route '" + method.toString() + "' to '" + path + "' it's already bounded to " + route.method.toString());
                }
            });
        };
        RestHandler.prototype.accept = function (req, res) {
        };
        RestHandler.prototype.handle = function (req, res) {
            var url = node_1.default.Url.parse(req.url, true);
            var root = this.config.path;
            var method = req.method.toUpperCase();
            var headers = req.headers;
            var query = url.query;
            if (url.pathname == root) {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    routes: RestHandler.routes,
                    config: RestHandler.config
                }));
            }
            else if (url.pathname.indexOf(root) == 0) {
                var route, matched, path = method + ' ' + url.pathname.replace(root, '');
                for (var r in RestHandler.routes) {
                    route = RestHandler.routes[r];
                    if (matched = route.match(path)) {
                        break;
                    }
                }
                if (matched) {
                    matched.shift();
                    var match = route.toJSON();
                    match.params = {};
                    match.query = query;
                    match.headers = headers;
                    route.params.forEach(function (p, i) {
                        match.params[p] = matched[i];
                    });
                    //resource.path = match.params;
                    //resource.method = match.params;
                    //resource.params = match.params;
                    var promise = Promise.resolve((req.body && req.body.length)
                        ? JSON.parse(req.body.toString())
                        : null);
                    promise = promise.then(function (body) {
                        if (match.body = body) {
                            matched.push(body);
                        }
                        match.matched = matched;
                        return route.execute(match);
                    });
                    promise = promise.then(function (result) {
                        if (result == null || typeof result == 'undefined') {
                            return rest_1.Result.create({
                                error: 'Resource Not Found',
                                code: 404
                            }, 404);
                        }
                        if (result instanceof rest_1.Result) {
                            return result;
                        }
                        else {
                            return rest_1.Result.create(JSON.stringify(result, null, '  '), 200, {
                                'Content-Type': 'application/json'
                            });
                        }
                    });
                    promise = promise.catch(function (result) {
                        if (result == null || typeof result == 'undefined') {
                            return rest_1.Result.create({
                                error: 'Resource Not Found',
                                code: 404
                            }, 404);
                        }
                        if (result instanceof rest_1.Result) {
                            return result;
                        }
                        else if (result instanceof Error) {
                            return rest_1.Result.create({
                                error: result.message,
                                code: result.code || 500,
                                details: result.details,
                                stack: result.stack.split("\n")
                            }, 500);
                        }
                        else {
                            return rest_1.Result.create({
                                error: 'Unknown Server Error',
                                code: 500,
                                data: result
                            }, 500);
                        }
                    });
                    promise = promise.then(function (result) {
                        res.writeHead(result.status, result.headers);
                        if (result.value) {
                            if (typeof result.value != "string") {
                                res.end(JSON.stringify(result.value));
                            }
                            else {
                                res.end(result.value);
                            }
                        }
                        else {
                            res.end();
                        }
                    });
                    return promise;
                }
                else {
                    // console.info(path,res);
                    res.writeHead(404, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify({
                        error: 'Invalid Resource',
                        code: 404
                    }));
                }
            }
        };
        RestHandler.__initializer = function(__parent){
            __super=__parent;
        };
        RestHandler.__decorator = function(__decorate,__type){
            __decorate(142,"config",8,Object,null,null,null);
            __decorate(144,"accept",0,Function,void 0,null,[
                ["req",0,Object],
                ["res",0,Object]
            ]);
            __decorate(144,"handle",0,Function,void 0,null,[
                ["req",0,Object],
                ["res",0,Object]
            ]);
            __decorate(146,"routes",1,Object,null,null,null);
            __decorate(144,"register",1,Function,void 0,null,[
                ["path",0,Object],
                ["resource",0,class_1.Class]
            ]);
            RestHandler = 
            __decorate(217, "constructor", 80, null, null, [
                [server_1.Server.handler,'rest']
            ], null,[
                handler_1.Handler
            ],null,null);
        };
        return RestHandler;
        function RestHandler() {
            __super.call(this);
            this.config = RestHandler.config;
        }
    })();
    module.define('class', RestHandler);
    module.export("RestHandler", RestHandler);
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            },
            function (server_1_1) {
                server_1 = server_1_1;
            },
            function (mime_1_1) {
                mime_1 = mime_1_1;
            },
            function (handler_1_1) {
                handler_1 = handler_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (class_1_1) {
                class_1 = class_1_1;
            },
            function (method_1_1) {
                method_1 = method_1_1;
            },
            function (member_1_1) {
                member_1 = member_1_1;
            },
            function (constructor_1_1) {
                constructor_1 = constructor_1_1;
            }],
        execute: function() {
            RestRoute = module.init(RestRoute);
            RestHandler = module.init(RestHandler,handler_1.Handler);
        }
    }
});
//# sourceMappingURL=rest.js.map