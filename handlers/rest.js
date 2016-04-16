System.register(['../node', '../server', './handler', '../rest'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var node_1, server_1, handler_1, rest_1;
    var RestRoute, RestHandler;
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
            function (rest_1_1) {
                rest_1 = rest_1_1;
            }],
        execute: function() {
            RestRoute = (function () {
                function RestRoute(resource, action, path) {
                    var _this = this;
                    this.resource = resource;
                    this.action = action;
                    this.method = action.toUpperCase();
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
                    this.regexp = new RegExp('^' + this.method + '\\s+' + this.regexp.join('\\/').toLowerCase() + '$');
                }
                RestRoute.prototype.match = function (path) {
                    return path.match(this.regexp);
                };
                RestRoute.prototype.toJSON = function () {
                    return {
                        method: this.method,
                        path: this.path,
                        resource: this.resource.name + '.' + this.action,
                        params: this.params,
                        regexp: this.regexp.toString()
                    };
                };
                RestRoute.prototype.toString = function () {
                    return 'Route(' + this.regexp.toString() + ')';
                };
                RestRoute.methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
                return RestRoute;
            })();
            exports_1("RestRoute", RestRoute);
            RestHandler = (function (_super) {
                __extends(RestHandler, _super);
                function RestHandler() {
                    _super.call(this);
                    this.config = RestHandler.config;
                }
                RestHandler.register = function (path, resource) {
                    var _this = this;
                    Object.getOwnPropertyNames(resource.prototype).forEach(function (method) {
                        if (RestRoute.methods.indexOf(method.toUpperCase()) >= 0) {
                            var route = new RestRoute(resource, method, path);
                            var routeId = route.toString();
                            if (!_this.routes[routeId]) {
                                _this.routes[routeId] = route;
                            }
                            else {
                                route = _this.routes[routeId];
                                throw new Error("Cant route '" + method.toUpperCase() + " " + method.toUpperCase() + "' to " + path + "." + resource.name + " it's already bounded to " + method + "." + route.resource.name);
                            }
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
                        var route, matched, path = method + ' ' + url.pathname.replace(root, '').toLowerCase();
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
                            var resource = new route.resource();
                            //resource.path = match.params;
                            //resource.method = match.params;
                            //resource.params = match.params;
                            var promise = Promise.resolve((req.body && req.body.length)
                                ? JSON.parse(req.body.toString())
                                : null);
                            promise = promise.then(function (body) {
                                resource.headers = match.headers;
                                resource.query = match.query;
                                resource.params = match.params;
                                if (body) {
                                    matched.push(body);
                                }
                                return route.resource.prototype[route.action].apply(resource, matched);
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
                RestHandler.routes = {};
                RestHandler = __decorate([
                    server_1.Server.handler('rest'), 
                    __metadata('design:paramtypes', [])
                ], RestHandler);
                return RestHandler;
            })(handler_1.Handler);
            exports_1("RestHandler", RestHandler);
        }
    }
});
//# sourceMappingURL=rest.js.map