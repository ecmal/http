system.register("http/ws/driver/http_parser", [], function(system,module,jsx) {
    var NodeHTTPParser, version;
    var HttpParser = (function (__super) {
        HttpParser.prototype.isComplete = function () {
            return this._complete;
        };
        HttpParser.prototype.parse = function (chunk) {
            var offset = (version < 6) ? 1 : 0, consumed = this._parser.execute(chunk, 0, chunk.length) + offset;
            if (this._complete) {
                this.body = (consumed < chunk.length)
                    ? chunk.slice(consumed)
                    : new Buffer(0);
            }
        };
        HttpParser.__initializer = function(__parent){
            __super=__parent;
            HttpParser.METHODS = {
                0: 'DELETE',
                1: 'GET',
                2: 'HEAD',
                3: 'POST',
                4: 'PUT',
                5: 'CONNECT',
                6: 'OPTIONS',
                7: 'TRACE',
                8: 'COPY',
                9: 'LOCK',
                10: 'MKCOL',
                11: 'MOVE',
                12: 'PROPFIND',
                13: 'PROPPATCH',
                14: 'SEARCH',
                15: 'UNLOCK',
                16: 'REPORT',
                17: 'MKACTIVITY',
                18: 'CHECKOUT',
                19: 'MERGE',
                24: 'PATCH'
            };
        };
        return HttpParser;
        function HttpParser(type) {
            var _this = this;
            if (type === 'request')
                this._parser = new NodeHTTPParser(NodeHTTPParser.REQUEST || 'request');
            else
                this._parser = new NodeHTTPParser(NodeHTTPParser.RESPONSE || 'response');
            this._type = type;
            this._complete = false;
            this.headers = {};
            var current = null;
            this._parser.onHeaderField = function (b, start, length) {
                current = b.toString('utf8', start, start + length).toLowerCase();
            };
            this._parser.onHeaderValue = function (b, start, length) {
                var value = b.toString('utf8', start, start + length);
                if (_this.headers.hasOwnProperty(current))
                    _this.headers[current] += ', ' + value;
                else
                    _this.headers[current] = value;
            };
            this._parser.onHeadersComplete = this._parser[NodeHTTPParser.kOnHeadersComplete] = function (majorVersion, minorVersion, headers, method, pathname, statusCode) {
                var info = majorVersion;
                if (typeof info === 'object') {
                    method = info.method;
                    pathname = info.url;
                    statusCode = info.statusCode;
                    headers = info.headers;
                }
                _this.method = (typeof method === 'number') ? HttpParser.METHODS[method] : method;
                _this.statusCode = statusCode;
                _this.url = pathname;
                if (!headers)
                    return;
                for (var i = 0, n = headers.length, key, value; i < n; i += 2) {
                    key = headers[i].toLowerCase();
                    value = headers[i + 1];
                    if (_this.headers.hasOwnProperty(key))
                        _this.headers[key] += ', ' + value;
                    else
                        _this.headers[key] = value;
                }
                _this._complete = true;
            };
        }
    })();
    module.define('class', HttpParser);
    module.export("HttpParser", HttpParser);
    return {
        setters:[],
        execute: function() {
            NodeHTTPParser = system.node.process.binding('http_parser').HTTPParser;
            version = NodeHTTPParser.RESPONSE ? 6 : 4;
            HttpParser = module.init(HttpParser);
        }
    }
});
//# sourceMappingURL=http_parser.js.map