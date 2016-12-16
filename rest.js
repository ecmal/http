system.register("http/rest", ['./handlers/rest', "runtime/decorators", "runtime/reflect/member", "runtime/reflect/constructor", "./handlers/ws"], function(system,module,jsx) {
    var rest_1, decorators_1, member_1, constructor_1, ws_1;
    var Path = (function (__super) {
        Path.prototype.decorate = function (member) {
            throw new Error("Invalid 'Rest' target " + member.toString());
        };
        Path.__initializer = function(__parent){
            __super=__parent;
        };
        return Path;
        function Path(path, options) {
            __super.call(this);
            this.path = path;
        }
    })();
    module.define('class', Path);
    module.export("Path", Path);
    var Rest = (function (__super) {
        Rest.prototype.decorate = function (member) {
            if (member instanceof constructor_1.Constructor) {
                rest_1.RestHandler.register(this.path, member.owner);
            }
            else {
                throw new Error("Invalid 'Rest' target " + member.toString());
            }
        };
        Rest.__initializer = function(__parent){
            __super=__parent;
        };
        return Rest;
        function Rest(path, options) {
            __super.call(this, path);
        }
    })();
    module.define('class', Rest);
    module.export("Rest", Rest);
    var WebSocket = (function (__super) {
        WebSocket.prototype.decorate = function (member) {
            if (member instanceof constructor_1.Constructor) {
                member.owner.metadata.ws = this.options;
                ws_1.WebSocketHandler.register(this.path, member.owner);
            }
            else {
                throw new Error("Invalid 'Rest' target " + member.toString());
            }
        };
        WebSocket.__initializer = function(__parent){
            __super=__parent;
        };
        return WebSocket;
        function WebSocket(path, options) {
            __super.call(this, path);
            this.options = options;
        }
    })();
    module.define('class', WebSocket);
    module.export("WebSocket", WebSocket);
    var Result = (function (__super) {
        Result.create = function (value, status, headers) {
            if (status === void 0) { status = 200; }
            if (headers === void 0) { headers = {}; }
            return new Result(value, status, headers);
        };
        return Result;
        function Result(value, status, headers) {
            if (status === void 0) { status = 200; }
            if (headers === void 0) { headers = {}; }
            this.value = value;
            this.status = status;
            this.headers = headers;
        }
    })();
    module.define('class', Result);
    module.export("Result", Result);
    return {
        setters:[
            function (rest_1_1) {
                rest_1 = rest_1_1;
            },
            function (decorators_1_1) {
                decorators_1 = decorators_1_1;
            },
            function (member_1_1) {
                member_1 = member_1_1;
            },
            function (constructor_1_1) {
                constructor_1 = constructor_1_1;
            },
            function (ws_1_1) {
                ws_1 = ws_1_1;
            }],
        execute: function() {
            Path = module.init(Path,decorators_1.Decorator);
            Rest = module.init(Rest,Path);
            WebSocket = module.init(WebSocket,Path);
            Result = module.init(Result);
        }
    }
});
//# sourceMappingURL=rest.js.map