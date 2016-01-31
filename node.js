System.register([], function(exports_1) {
    var Node;
    return {
        setters:[],
        execute: function() {
            Node = (function () {
                function Node() {
                }
                Node.require = function (path) {
                    return require(path);
                };
                Object.defineProperty(Node, "Buffer", {
                    get: function () {
                        return this.require('buffer');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Http", {
                    get: function () {
                        return this.require('http');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Https", {
                    get: function () {
                        return this.require('https');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Fs", {
                    get: function () {
                        return this.require('fs');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Path", {
                    get: function () {
                        return this.require('path');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Url", {
                    get: function () {
                        return this.require('url');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Qs", {
                    get: function () {
                        return this.require('querystring');
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Node, "Zlib", {
                    get: function () {
                        return this.require('zlib');
                    },
                    enumerable: true,
                    configurable: true
                });
                return Node;
            })();
            exports_1("default", Node);
        }
    }
});
//# sourceMappingURL=node.js.map