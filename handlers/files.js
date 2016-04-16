System.register(['../node', '../server', '../mime', './handler'], function(exports_1) {
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
    var node_1, server_1, mime_1, handler_1;
    var FileRoute, FileHandler;
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
            }],
        execute: function() {
            FileRoute = (function () {
                function FileRoute(settings) {
                    if (typeof settings == 'string') {
                        settings = [/^\/(.*)$/i, (settings + "/$1")];
                    }
                    this.pattern = settings.shift();
                    this.location = settings.shift();
                }
                FileRoute.prototype.match = function (url) {
                    if (url.match(this.pattern)) {
                        return url.replace(this.pattern, this.location);
                    }
                };
                FileRoute.prototype.toString = function () {
                    return "Route(" + this.pattern + " -> " + this.location + ")";
                };
                return FileRoute;
            })();
            FileHandler = (function (_super) {
                __extends(FileHandler, _super);
                function FileHandler() {
                    var _this = this;
                    _super.call(this);
                    this.config = FileHandler.config;
                    this.routes = [];
                    if (typeof this.config.path == 'string') {
                        this.config.path = [this.config.path];
                    }
                    this.config.path.forEach(function (p) {
                        _this.routes.push(new FileRoute(p));
                    });
                }
                FileHandler.prototype.resource = function (path) {
                    try {
                        var stat = node_1.default.Fs.statSync(path);
                        if (stat.isDirectory()) {
                            return this.resource(node_1.default.Path.resolve(path, 'index.html'));
                        }
                        else if (stat.isFile()) {
                            return { exist: true, path: path };
                        }
                        else {
                            return { exist: false, path: path };
                        }
                    }
                    catch (e) {
                        return { exist: false, path: path };
                    }
                };
                FileHandler.prototype.accept = function (req, res) {
                };
                FileHandler.prototype.handle = function (req, res) {
                    var path = req.url.split('?')[0];
                    for (var file, i = 0; i < this.routes.length; i++) {
                        file = this.routes[i].match(path);
                        if (file && (file = this.resource(file)).exist) {
                            break;
                        }
                    }
                    if (file && file.exist) {
                        res.writeHead(200, {
                            'Content-Type': mime_1.Mime.getType(file.path)
                        });
                        res.stream = node_1.default.Fs.createReadStream(file.path);
                    }
                    else {
                        res.writeHead(404, {
                            'Content-Type': mime_1.Mime.getType(file ? file.path : 'req.url')
                        });
                        res.end('File Not Found');
                    }
                };
                FileHandler = __decorate([
                    server_1.Server.handler('files'), 
                    __metadata('design:paramtypes', [])
                ], FileHandler);
                return FileHandler;
            })(handler_1.Handler);
        }
    }
});
//# sourceMappingURL=files.js.map