System.register(['./handlers/rest'], function(exports_1) {
    var rest_1;
    var Result;
    function Rest(path) {
        return function (resource) {
            rest_1.RestHandler.register(path, resource);
        };
    }
    exports_1("Rest", Rest);
    return {
        setters:[
            function (rest_1_1) {
                rest_1 = rest_1_1;
            }],
        execute: function() {
            Result = (function () {
                function Result(value, status, headers) {
                    if (status === void 0) { status = 200; }
                    if (headers === void 0) { headers = {}; }
                    this.value = value;
                    this.status = status;
                    this.headers = headers;
                }
                Result.create = function (value, status, headers) {
                    if (status === void 0) { status = 200; }
                    if (headers === void 0) { headers = {}; }
                    return new Result(value, status, headers);
                };
                return Result;
            })();
            exports_1("Result", Result);
        }
    }
});
//# sourceMappingURL=rest.js.map