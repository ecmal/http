system.register("http/handler", [], function(system,module,jsx) {
    var HttpHandler = (function (__super) {
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
        function HttpHandler(settings) {
            this.configure(settings);
        }
    })();
    module.define('class', HttpHandler);
    module.export("default", HttpHandler);
    return {
        setters:[],
        execute: function() {
            HttpHandler = module.init(HttpHandler);
        }
    }
});
//# sourceMappingURL=handler.js.map