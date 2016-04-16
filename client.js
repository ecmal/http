System.register(['./node', './utils'], function(exports_1) {
    var node_1, utils_1;
    var Client;
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            Client = (function () {
                function Client(url, headers) {
                    if (url) {
                        this.configure(url, headers);
                    }
                }
                Client.prototype.configure = function (url, headers) {
                    if (typeof url == 'string') {
                        url = node_1.default.Url.parse(url, true);
                    }
                    this.protocol = url.protocol;
                    this.host = url.hostname;
                    this.port = url.port;
                    this.path = url.pathname;
                    this.headers = headers || {};
                    this.streamed = false;
                    switch (url.protocol) {
                        case 'http:':
                            this.service = node_1.default.Http;
                            break;
                        case 'https:':
                            this.service = node_1.default.Https;
                            break;
                        default: throw new Error('invalid http protocol ' + url.protocol);
                    }
                };
                Client.prototype.initRequest = function (req) {
                    var url = node_1.default.Url.parse(req.url || req.path);
                    return (utils_1.default.cleanup({
                        method: req.method || 'GET',
                        hostname: url.hostname || req.host || this.host,
                        port: url.port || req.port || this.port || undefined,
                        headers: utils_1.default.merge(this.headers, req.headers),
                        path: node_1.default.Path.resolve(this.path, url.path || '') + ((url.query || req.query) ? '?' + node_1.default.Qs.stringify(url.query || req.query) : ''),
                        content: req.content
                    }));
                };
                Client.prototype.initResponse = function (req, res) {
                    res.streamed = req.streamed || this.streamed;
                    var contentType = res.headers['content-type'];
                    var contentEncoding = res.headers['content-encoding'];
                    if ((contentType && contentType.indexOf('application/x-gzip') >= 0) ||
                        contentEncoding && contentEncoding.indexOf('gzip') >= 0) {
                        return res.pipe(node_1.default.Zlib.createGunzip());
                    }
                    else {
                        return res;
                    }
                };
                Client.prototype.encode = function (req) {
                    return req.content;
                };
                Client.prototype.decode = function (res) {
                    return res;
                };
                Client.prototype.onRequest = function (req) { };
                Client.prototype.onSuccess = function (req, res) { };
                Client.prototype.onFailure = function (req, err) { };
                Client.prototype.request = function (req) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        req = _this.initRequest(req);
                        _this.onRequest(req);
                        var request = _this.service.request(req);
                        request.on('error', function (err) {
                            err.request = req;
                            _this.onFailure(req, err);
                            reject(err);
                        });
                        request.on('response', function (res) {
                            var response = {
                                status: res.statusCode,
                                message: res.statusMessage,
                                headers: res.headers,
                                content: null
                            };
                            res = _this.initResponse(req, res);
                            if (request.streamed) {
                                resolve({
                                    stream: req,
                                    status: res.statusCode,
                                    headers: res.headers
                                });
                            }
                            else {
                                var content = new Buffer(0);
                                res.on('data', function (chunk) { return content = Buffer.concat([content, chunk], content.length + chunk.length); });
                                res.on('end', function () {
                                    try {
                                        response.content = content;
                                        response = _this.decode(response);
                                        _this.onSuccess(req, response);
                                        resolve(response);
                                    }
                                    catch (error) {
                                        _this.onFailure(req, error);
                                        reject(error);
                                    }
                                });
                                res.on('error', function (error) {
                                    _this.onFailure(req, error);
                                    reject(error);
                                });
                            }
                        });
                        req.content = _this.encode(req) || req.content;
                        if (req.content) {
                            request.end(req.content);
                        }
                        else {
                            request.end();
                        }
                    });
                };
                return Client;
            })();
            exports_1("Client", Client);
        }
    }
});
//# sourceMappingURL=client.js.map