system.register("http/handlers/files", ['../node', '../server', '../mime', './handler'], function(system,module,jsx) {
    var node_1, server_1, mime_1, handler_1;
    var FileRoute = (function (__super) {
        FileRoute.prototype.match = function (url) {
            if (url.match(this.pattern)) {
                return url.replace(this.pattern, this.location);
            }
        };
        FileRoute.prototype.toString = function () {
            return "Route(" + this.pattern + " -> " + this.location + ")";
        };
        return FileRoute;
        function FileRoute(settings) {
            if (typeof settings == 'string') {
                settings = [/^\/(.*)$/i, (settings + "/$1")];
            }
            this.pattern = settings.shift();
            this.location = settings.shift();
        }
    })();
    module.define('class', FileRoute);
    module.export("FileRoute", FileRoute);
    var FileHandler = (function (__super) {
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
                var status = 200;
                var cache = this.config.cache;
                var headers = {
                    'Content-Type': mime_1.Mime.getType(file.path)
                };
                if (cache) {
                    headers['Cache-Control'] = 'public, max-age=86400';
                    headers['Expires'] = new Date(new Date().getTime() + 86400000).toUTCString();
                }
                else {
                    headers['Cache-Control'] = 'no-cache';
                }
                res.stream = node_1.default.Fs.createReadStream(file.path);
                var ae = req.headers['accept-encoding'];
                if (ae && ae.indexOf('gzip') >= 0) {
                    headers['Content-Encoding'] = 'gzip';
                    res.stream = res.stream.pipe(node_1.default.Zlib.createGzip());
                }
                res.writeHead(status, headers);
            }
            else {
                res.writeHead(404, {
                    'Content-Type': mime_1.Mime.getType(file ? file.path : req.url)
                });
                res.end('File Not Found');
            }
        };
        FileHandler.__initializer = function(__parent){
            __super=__parent;
        };
        FileHandler.__decorator = function(__decorate,__type){
            __decorate(142,"config",0,Object,null,null,null);
            __decorate(142,"routes",0,Object,null,null,null);
            __decorate(144,"resource",8,Function,void 0,null,[
                ["path",0,Object]
            ]);
            __decorate(144,"accept",8,Function,void 0,null,[
                ["req",0,Object],
                ["res",0,Object]
            ]);
            __decorate(144,"handle",8,Function,void 0,null,[
                ["req",0,Object],
                ["res",0,Object]
            ]);
            FileHandler = 
            __decorate(217, "constructor", 80, null, null, [
                [server_1.Server.handler,'files']
            ], null,[
                handler_1.Handler
            ],null,null);
        };
        return FileHandler;
        function FileHandler() {
            var _this = this;
            __super.call(this);
            this.config = FileHandler.config;
            this.routes = [];
            if (typeof this.config.path == 'string') {
                this.config.path = [this.config.path];
            }
            this.config.path.forEach(function (p) {
                _this.routes.push(new FileRoute(p));
            });
        }
    })();
    module.define('class', FileHandler);
    module.export("FileHandler", FileHandler);
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
            FileRoute = module.init(FileRoute);
            FileHandler = module.init(FileHandler,handler_1.Handler);
        }
    }
});
//# sourceMappingURL=files.js.map