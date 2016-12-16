system.register("http/handlers/handler", [], function(system,module,jsx) {
    var Handler = (function (__super) {
        Handler.configure = function (server, config) {
            this.server = server;
            this.config = config;
            return this;
        };
        return Handler;
        function Handler() {
        }
    })();
    module.define('class', Handler);
    module.export("Handler", Handler);
    return {
        setters:[],
        execute: function() {
            Handler = module.init(Handler);
        }
    }
});
//# sourceMappingURL=handler.js.map