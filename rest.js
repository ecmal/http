system.register("http/rest", ['./handlers/rest'], function(system,module) {
    var rest_1;
    function Rest(path) {
        return function (resource) {
            rest_1.RestHandler.register(path, resource);
        };
    }
    module.define('function', Rest)
    module.export("Rest", Rest);
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
            }],
        execute: function() {
            Result = module.init(Result);
        }
    }
});
//# sourceMappingURL=rest.js.map