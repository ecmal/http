system.register("http/ws/driver", ['./driver/base', './driver/client', './driver/server'], function(system,module,jsx) {
    var base_1, client_1, server_1;
    var Driver = (function (__super) {
        Driver.client = function (url, options) {
            return new client_1.Client(url, options);
        };
        Driver.server = function (options) {
            return new server_1.Server(options);
        };
        Driver.http = function (request, options) {
            return server_1.Server.http(request, options);
        };
        Driver.isSecureRequest = function (request) {
            return server_1.Server.isSecureRequest(request);
        };
        Driver.isWebSocket = function (request) {
            return server_1.Server.isWebSocket(request);
        };
        Driver.validateOptions = function (options, validKeys) {
            base_1.Base.validateOptions(options, validKeys);
        };
        return Driver;
        function Driver() {
        }
    })();
    module.define('class', Driver);
    module.export("Driver", Driver);
    return {
        setters:[
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (client_1_1) {
                client_1 = client_1_1;
            },
            function (server_1_1) {
                server_1 = server_1_1;
            }],
        execute: function() {
            Driver = module.init(Driver);
        }
    }
});
//# sourceMappingURL=driver.js.map