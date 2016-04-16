System.register([], function(exports_1) {
    var Handler;
    return {
        setters:[],
        execute: function() {
            Handler = (function () {
                function Handler() {
                }
                Handler.configure = function (server, config) {
                    this.server = server;
                    this.config = config;
                    return this;
                };
                return Handler;
            })();
            exports_1("Handler", Handler);
        }
    }
});
//# sourceMappingURL=handler.js.map