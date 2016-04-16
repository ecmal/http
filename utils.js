System.register([], function(exports_1) {
    var Utils;
    return {
        setters:[],
        execute: function() {
            Utils = (function () {
                function Utils() {
                }
                Utils.prototype.merge = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    return this.patch.apply(this, [{}].concat(args));
                };
                Utils.prototype.patch = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    var n, o = args.shift();
                    while (args.length) {
                        n = args.shift();
                        if (typeof n == 'object' && n) {
                            Object.keys(n).forEach(function (k) {
                                o[k] = n[k];
                            });
                        }
                    }
                    return o;
                };
                Utils.prototype.cleanup = function (object) {
                    for (var i in object) {
                        var v = object[i];
                        if (typeof v == 'undefined' ||
                            v == null || v == '' ||
                            (Array.isArray(v) && v.length == 0) ||
                            (typeof v == 'object' && Object.keys(v).length == 0)) {
                            delete object[i];
                        }
                    }
                    return object;
                };
                return Utils;
            })();
            exports_1("Utils", Utils);
            exports_1("default",new Utils());
        }
    }
});
//# sourceMappingURL=utils.js.map