System.register(['../server', '../rest', '../handlers/files', '../handlers/rest'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var server_1, rest_1;
    var HelloResource, server;
    return {
        setters:[
            function (server_1_1) {
                server_1 = server_1_1;
            },
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (_1) {},
            function (_2) {}],
        execute: function() {
            HelloResource = (function () {
                function HelloResource() {
                }
                HelloResource.prototype.get = function () {
                    return {
                        resource: 'Hello',
                        query: this.query,
                        headers: this.headers
                    };
                };
                HelloResource = __decorate([
                    rest_1.Rest('/hello')
                ], HelloResource);
                return HelloResource;
            })();
            server = new server_1.Server({
                host: '0.0.0.0',
                port: 3000,
                rest: {
                    path: '/api'
                },
                files: {
                    path: './web'
                }
            }).start();
        }
    }
});
//# sourceMappingURL=server.js.map