System.register([], function(exports_1) {
    var HttpHandler;
    return {
        setters:[],
        execute: function() {
            HttpHandler = (function () {
                function HttpHandler(settings) {
                    this.configure(settings);
                }
                Object.defineProperty(HttpHandler.prototype, "settings", {
                    get: function () {
                        return this.$.settings;
                    },
                    enumerable: true,
                    configurable: true
                });
                HttpHandler.prototype.configure = function (settings) {
                    this.$ = {
                        settings: settings
                    };
                    return this;
                };
                HttpHandler.prototype.initialize = function (server) {
                    console.info("Initializeing " + this.constructor.name);
                };
                HttpHandler.prototype.handle = function (req, res) {
                    throw new Error("Unimplemented Method 'handler' in class " + this.constructor.name);
                };
                return HttpHandler;
            })();
            exports_1("default", HttpHandler);
        }
    }
});
//# sourceMappingURL=handler.js.map